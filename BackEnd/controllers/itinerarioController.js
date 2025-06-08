// Import dei modelli e librerie necessarie
const Itinerario = require("../models/itinerarioModel");
const Segnalazione = require("../models/segnalazioneModel");
const Sensore = require("../models/sensoreAffollamentoModel");
const axios = require("axios");

// Chiave API per le richieste a Google Maps
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Pesi per i vari fattori di sicurezza
const PESO_NEGOZIO = 1; // presenza di negozi aperti
const PESO_SENSORE_MEDIO = 1; // sensore con affollamento >= 50%
const PESO_SENSORE_ALTO = 2; // sensore con affollamento >= 70%
const PESO_SEGNALAZIONE = -2; // penalità per segnalazioni di crimini

// Funzione per calcolare la distanza in metri tra due coordinate [lon, lat] usando la formula dell'haversine
function distanza(a, b) {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const R = 6371e3; // Raggio terrestre in metri
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a_ =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_));
  return R * c; // Distanza finale in metri
}

// Funzione per ottenere l'indirizzo formattato da coordinate (reverse geocoding)
async function reverseGeocode(coordinate) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate[1]},${coordinate[0]}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await axios.get(url);
    const result = res.data.results[0];
    return result?.formatted_address || "Via sconosciuta";
  } catch (error) {
    console.error("Reverse geocoding fallito:", error.message);
    return "Via sconosciuta";
  }
}

// Controller per generare un percorso sicuro
const generaPercorsoSicuro = async (req, res) => {
  try {
    const { partenza, destinazione } = req.body;

    // Verifica la presenza delle coordinate
    if (!partenza?.coordinate || !destinazione?.coordinate) {
      return res.status(400).json({ message: "Coordinate mancanti." });
    }

    // 1. Ottiene il percorso veloce (standard) dalla Google Directions API
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${partenza.coordinate[1]},${partenza.coordinate[0]}&destination=${destinazione.coordinate[1]},${destinazione.coordinate[0]}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(directionsUrl);
    const steps = response.data.routes[0]?.legs[0]?.steps || [];

    // Estrae le tappe intermedie del percorso veloce
    const percorsoFast = steps.map((step) => [
      step.end_location.lng,
      step.end_location.lat,
    ]);
    console.log("Tappe percorso fast:", percorsoFast);

    // 2. Recupera segnalazioni e sensori di affollamento dal database
    const [segnalazioni, sensori] = await Promise.all([
      Segnalazione.find(),
      Sensore.find(),
    ]);

    // 3. Cerca esercizi commerciali aperti vicino alla partenza tramite Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${partenza.coordinate[1]},${partenza.coordinate[0]}&radius=1000&type=store&opennow=true&key=${GOOGLE_MAPS_API_KEY}`;
    const placesResp = await axios.get(placesUrl);
    const esercizi = placesResp.data.results.map((es) => ({
      nome: es.name,
      coordinate: [es.geometry.location.lng, es.geometry.location.lat],
      indirizzo: es.vicinity || "ND",
    }));

    // 4. Costruisce tappe alternative in base a uno score di sicurezza.
    //    Per ogni step del percorso veloce cerca POI e sensori vicini e
    //    valuta possibili deviazioni più sicure.
    const tappeSicure = [];

    // Funzione di supporto per calcolare lo score di un punto
    const calcolaScore = (p) => {
      let s = 0;

      // Incrementa se nelle vicinanze c'è almeno un esercizio aperto
      if (esercizi.some((es) => distanza(p, es.coordinate) < 150)) {
        s += PESO_NEGOZIO;
      }

      // Aggiunge punteggio in base al livello di affollamento rilevato dai sensori
      sensori.forEach((sn) => {
        if (distanza(p, sn.coordinate) < 150) {
          if (sn.affollamentoCalcolato >= 70) s += PESO_SENSORE_ALTO;
          else if (sn.affollamentoCalcolato >= 50) s += PESO_SENSORE_MEDIO;
        }
      });

      // Penalizza se ci sono segnalazioni di reati nelle vicinanze
      if (segnalazioni.some((seg) => distanza(p, seg.tappa.coordinate) < 150)) {
        s += PESO_SEGNALAZIONE;
      }

      return s;
    };

    const RADIUS_DETOUR = 200; // raggio per cercare deviazioni possibili

    for (const point of percorsoFast) {
      // Punteggio del punto della fast route
      let bestPoint = point;
      let bestScore = calcolaScore(point);

      // Candidati vicini (esercizi o sensori) come possibili deviazioni
      const candidati = [
        ...esercizi
          .filter((es) => distanza(point, es.coordinate) < RADIUS_DETOUR)
          .map((es) => es.coordinate),
        ...sensori
          .filter((s) => distanza(point, s.coordinate) < RADIUS_DETOUR)
          .map((s) => s.coordinate),
      ];

      for (const cand of candidati) {
        const candScore = calcolaScore(cand);
        if (candScore > bestScore) {
          bestPoint = cand;
          bestScore = candScore;
        }
      }

      // Se il migliore è positivo lo aggiunge tra le tappe sicure
      if (bestScore > 0) {
        const nomeVia = await reverseGeocode(bestPoint);
        tappeSicure.push({
          nome: nomeVia,
          coordinate: bestPoint,
        });
      }
    }

    // 5. Calcola il grado di sicurezza complessivo in base alla percentuale di tappe sicure
    const ratioSicurezza = tappeSicure.length / percorsoFast.length;
    let grado = "Basso";
    if (ratioSicurezza > 0.7) grado = "Alto";
    else if (ratioSicurezza > 0.3) grado = "Medio";

    // 6. Se il percorso è troppo poco sicuro o con troppe poche tappe, fallisce
    if (tappeSicure.length < 4 || grado === "Basso") {
      return res.status(200).json({
        message:
          "Percorso non abbastanza sicuro o poco significativo. Si consiglia l'uso di un mezzo proprio.",
        gradoSicurezzaTotale: grado,
        itinerario: null,
      });
    }

    // 7. Rimuove tappe troppo vicine tra loro (duplicati)
    const tappeFinali = [
      partenza,
      ...tappeSicure.filter(
        (t, i, arr) =>
          i === 0 || distanza(t.coordinate, arr[i - 1].coordinate) > 30
      ),
      destinazione,
    ];

    // 8. Elimina eventuali tappe che causerebbero deviazioni eccessive o
    //    "rami" nella poliline. Se la somma delle distanze prev->curr e
    //    curr->next è molto più grande della distanza diretta prev->next,
    //    la tappa intermedia non porta vantaggi e viene rimossa.
    const MAX_DEVIATION_RATIO = 2; // tolleranza sul tragitto
    for (let i = 1; i < tappeFinali.length - 1; i++) {
      const prev = tappeFinali[i - 1].coordinate;
      const curr = tappeFinali[i].coordinate;
      const next = tappeFinali[i + 1].coordinate;
      const direct = distanza(prev, next);
      const withStop = distanza(prev, curr) + distanza(curr, next);
      if (withStop > MAX_DEVIATION_RATIO * direct) {
        tappeFinali.splice(i, 1);
        i--; // ricontrolla la nuova combinazione
      }
    }

    // 9. Controlla se il percorso sicuro è di fatto identico alla fast route.
    //    Ora le tappe sicure possono includere deviazioni, quindi verifichiamo
    //    semplicemente che ogni tappa (escluse partenza e destinazione) sia
    //    molto vicina a una delle tappe del percorso veloce.
    const ugualeAFast = tappeFinali
      .slice(1, -1)
      .every((t) =>
        percorsoFast.some((coord) => distanza(coord, t.coordinate) < 20)
      );

    if (ugualeAFast) {
      return res.status(200).json({
        message: "Non esiste un'alternativa più sicura al percorso veloce.",
        gradoSicurezzaTotale: grado,
        itinerario: null,
      });
    }

    // 10. Salva il nuovo itinerario nel database
    console.log(
      "Tappe percorso sicuro:",
      tappeFinali.map((t) => t.coordinate)
    );

    const nuovoItinerario = await Itinerario.create({
      tappe: tappeFinali,
      eserciziCommerciali: esercizi,
      autobus: [],
      taxiReperibili: [],
      casermeForzeOrdine: [],
      infoComunali: [],
      gradoSicurezzaTotale: grado,
    });

    // Risposta di successo con l'itinerario generato
    res.status(200).json({
      message: "Percorso sicuro generato con successo",
      itinerario: nuovoItinerario,
    });
  } catch (err) {
    // Gestione errori generici
    console.error("Errore backend:", err);
    res.status(500).json({ message: "Errore interno", error: err.message });
  }
};

// Esporta il controller
module.exports = { generaPercorsoSicuro };

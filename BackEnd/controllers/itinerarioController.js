const Itinerario = require("../models/itinerarioModel");
const Segnalazione = require("../models/segnalazioneModel");
const Sensore = require("../models/sensoreAffollamentoModel");
const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Calcola distanza tra due coordinate [lon, lat] in metri
function distanza(a, b) {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a_ =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_));
  return R * c;
}

// Esegue una chiamata reverse geocoding per ottenere il nome della via da coordinate
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

const generaPercorsoSicuro = async (req, res) => {
  try {
    const { partenza, destinazione } = req.body;
    if (!partenza?.coordinate || !destinazione?.coordinate) {
      return res.status(400).json({ message: "Coordinate mancanti." });
    }

    // 1. Ottieni percorso veloce (fast) da Google Directions API
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${partenza.coordinate[1]},${partenza.coordinate[0]}&destination=${destinazione.coordinate[1]},${destinazione.coordinate[0]}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(directionsUrl);
    const steps = response.data.routes[0]?.legs[0]?.steps || [];

    const percorsoFast = steps.map((step) => [
      step.end_location.lng,
      step.end_location.lat,
    ]);
    console.log("Tappe percorso fast:", percorsoFast);

    // 2. Ottieni segnalazioni e sensori dal DB
    const [segnalazioni, sensori] = await Promise.all([
      Segnalazione.find(),
      Sensore.find(),
    ]);

    // 3. Esercizi commerciali aperti tramite Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${partenza.coordinate[1]},${partenza.coordinate[0]}&radius=1000&type=store&opennow=true&key=${GOOGLE_MAPS_API_KEY}`;
    const placesResp = await axios.get(placesUrl);
    const esercizi = placesResp.data.results.map((es) => ({
      nome: es.name,
      coordinate: [es.geometry.location.lng, es.geometry.location.lat],
      indirizzo: es.vicinity || "ND",
    }));

    // 4. Costruzione tappe sicure basata su score e reverse geocoding
    const tappeSicure = [];

    for (const point of percorsoFast) {
      let score = 0;

      if (esercizi.some((es) => distanza(point, es.coordinate) < 150)) score++;
      if (
        sensori.some(
          (s) =>
            distanza(point, s.coordinate) < 150 && s.affollamentoCalcolato >= 50
        )
      )
        score++;
      if (segnalazioni.some((s) => distanza(point, s.tappa.coordinate) < 150))
        score--;

      if (score > 0) {
        const nomeVia = await reverseGeocode(point);
        tappeSicure.push({
          nome: nomeVia,
          coordinate: point,
        });
      }
    }

    // 5. Calcolo grado sicurezza
    const ratioSicurezza = tappeSicure.length / percorsoFast.length;
    let grado = "Basso";
    if (ratioSicurezza > 0.7) grado = "Alto";
    else if (ratioSicurezza > 0.3) grado = "Medio";

    // 6. Vincolo: numero minimo tappe sicure
    if (tappeSicure.length < 4 || grado === "Basso") {
      return res.status(200).json({
        message:
          "Percorso non abbastanza sicuro o poco significativo. Si consiglia l'uso di un mezzo proprio.",
        gradoSicurezzaTotale: grado,
        itinerario: null,
      });
    }

    // 7. Rimozione duplicati troppo vicini
    const tappeFinali = [
      partenza,
      ...tappeSicure.filter(
        (t, i, arr) =>
          i === 0 || distanza(t.coordinate, arr[i - 1].coordinate) > 30
      ),
      destinazione,
    ];

    // 8. Verifica se percorso sicuro coincide col fast
    const ugualeAFast =
      tappeFinali.length === percorsoFast.length + 2 &&
      percorsoFast.every(
        (coord, idx) => distanza(coord, tappeFinali[idx + 1]?.coordinate) < 20
      );

    if (ugualeAFast) {
      return res.status(200).json({
        message: "Non esiste un'alternativa più sicura al percorso veloce.",
        gradoSicurezzaTotale: grado,
        itinerario: null,
      });
    }

    console.log(
      "Tappe percorso sicuro:",
      tappeFinali.map((t) => t.coordinate)
    );

    // 9. Salva l'itinerario su DB
    const nuovoItinerario = await Itinerario.create({
      tappe: tappeFinali,
      eserciziCommerciali: esercizi,
      autobus: [],
      taxiReperibili: [],
      casermeForzeOrdine: [],
      infoComunali: [],
      gradoSicurezzaTotale: grado,
    });

    res.status(200).json({
      message: "Percorso sicuro generato con successo",
      itinerario: nuovoItinerario,
    });
  } catch (err) {
    console.error("Errore backend:", err);
    res.status(500).json({ message: "Errore interno", error: err.message });
  }
};

module.exports = { generaPercorsoSicuro };

const Itinerario = require("../models/itinerarioModel");
const Segnalazione = require("../models/segnalazioneModel");
const Sensore = require("../models/sensoreAffollamentoModel");
const axios = require("axios");
const { tappaSchema } = require("../models/tappaModel");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Imposta nel .env

// Funzione ausiliaria: calcola distanza euclidea tra due coordinate [lon, lat]
function distanza(a, b) {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const R = 6371e3; // metri
  const φ1 = (lat1 * Math.PI) / 180,
    φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a_ =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_));

  return R * c; // distanza in metri
}

const generaPercorsoSicuro = async (req, res) => {
  try {
    const { partenza, destinazione } = req.body; // partenza e destinazione: {nome, coordinate: [lon, lat]}

    if (
      !partenza ||
      !destinazione ||
      !partenza.coordinate ||
      !destinazione.coordinate
    ) {
      return res
        .status(400)
        .json({
          message: "Partenza e destinazione con coordinate obbligatorie.",
        });
    }

    // Crea tappe base
    const tappe = [partenza, destinazione];

    // Recupera tutte le segnalazioni nel raggio di 300m dal percorso (mock semplice)
    const segnalazioni = await Segnalazione.find();
    const pericolose = segnalazioni.filter((s) => {
      const coord = s.tappa.coordinate;
      return tappe.some((tappa) => distanza(tappa.coordinate, coord) < 300);
    });

    // Recupera sensori nel raggio di 300m con affollamento > soglia
    const sensori = await Sensore.find();
    const sogliaAffollamento = 50;
    const zoneAffollate = sensori.filter((s) => {
      return (
        tappe.some((t) => distanza(t.coordinate, s.coordinate) < 300) &&
        s.affollamentoCalcolato > sogliaAffollamento
      );
    });

    // Simulazione: calcolo grado sicurezza
    let grado = "Alto";
    if (pericolose.length > 5 || zoneAffollate.length > 3) {
      grado = "Basso";
    } else if (pericolose.length > 0 || zoneAffollate.length > 0) {
      grado = "Medio";
    }

    // Chiamata a Google Maps Places API (per esercizi commerciali aperti tra le due coordinate)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${partenza.coordinate[1]},${partenza.coordinate[0]}&radius=500&type=store&opennow=true&key=${GOOGLE_MAPS_API_KEY}`;
    const esercizi = await axios.get(placesUrl);

    const eserciziMappati = esercizi.data.results.map((es) => ({
      nome: es.name,
      coordinate: [es.geometry.location.lng, es.geometry.location.lat],
      indirizzo: es.vicinity || "ND",
    }));

    const nuovoItinerario = await Itinerario.create({
      tappe,
      eserciziCommerciali: eserciziMappati,
      gradoSicurezzaTotale: grado,
      autobus: [],
      taxiReperibili: [],
      casermeForzeOrdine: [],
      infoComunali: [],
    });

    res
      .status(200)
      .json({
        message: "Percorso sicuro generato",
        itinerario: nuovoItinerario,
      });
  } catch (error) {
    console.error("Errore generazione percorso sicuro:", error);
    res.status(500).json({ message: "Errore interno", error: error.message });
  }
};

module.exports = { generaPercorsoSicuro };

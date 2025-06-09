const axios = require("axios");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const autocomplete = async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ message: "input required" });
    }
    const url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    const response = await axios.get(url, {
      params: {
        input,
        key: GOOGLE_MAPS_API_KEY,
        language: "it",
        components: "country:it",
      },
    });
    res.json(response.data.predictions);
  } catch (err) {
    console.error("Autocomplete error:", err.message);
    res.status(500).json({ message: "Autocomplete error" });
  }
};

const details = async (req, res) => {
  try {
    const { place_id } = req.query;
    if (!place_id) {
      return res.status(400).json({ message: "place_id required" });
    }
    const url = "https://maps.googleapis.com/maps/api/place/details/json";
    const response = await axios.get(url, {
      params: {
        place_id,
        key: GOOGLE_MAPS_API_KEY,
        language: "it",
      },
    });
    res.json(response.data.result);
  } catch (err) {
    console.error("Place details error:", err.message);
    res.status(500).json({ message: "Place details error" });
  }
};

module.exports = { autocomplete, details };

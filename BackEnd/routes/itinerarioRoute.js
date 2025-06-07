const express = require("express");
const router = express.Router();
const { generaPercorsoSicuro } = require("../controllers/itinerarioController");

router.post("/percorso-sicuro", generaPercorsoSicuro);

module.exports = router;

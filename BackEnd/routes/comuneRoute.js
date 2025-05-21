const express = require("express");
const router = express.Router();
const { generaTokenComune } = require("../controllers/comuneController");

// POST: genera token dopo verifica password
router.post("/genera-token", generaTokenComune);

module.exports = router;

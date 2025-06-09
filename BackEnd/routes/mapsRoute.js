const express = require("express");
const router = express.Router();
const { autocomplete, details } = require("../controllers/mapsController");

router.get("/autocomplete", autocomplete);
router.get("/details", details);

module.exports = router;

const express = require('express');
const router = express.Router();

const { creaSegnalazione } = require('../controllers/cittadinoController');

router.post('/', creaSegnalazione); //Sposta in cittadino Route

module.exports = router;
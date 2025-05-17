const express = require('express');
const router = express.Router();

const { creaSegnalazione } = require('../controllers/cittadinoController');

router.post('/', creaSegnalazione);

module.exports = router;
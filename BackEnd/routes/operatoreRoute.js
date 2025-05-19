const express = require('express');
const router = express.Router();
const { signupOperatore } = require('../controllers/operatoreController');

router.post('/signup-operatore', signupOperatore);

module.exports = router;

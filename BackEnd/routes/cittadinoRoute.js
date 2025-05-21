const express = require('express');
const router = express.Router();

const { signUp, confirmEmail, login, googleLogin, creaSegnalazione } = require('../controllers/cittadinoController');

router.post('/signup', signUp);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post("/segnalazione", creaSegnalazione);


module.exports = router;
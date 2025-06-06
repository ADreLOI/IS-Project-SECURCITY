const express = require('express');
const router = express.Router();
const authenticateJWT  = require('../middleware/jwtCheck');

const { signUp, confirmEmail, login, googleLogin, creaSegnalazione, getCittadinoByID, addContattoEmergenza, deleteContattoEmergenza, editContattoEmergenza, editProfile, reSendConfirmationEmail, getAllSegnalazioni, recuperaPassword, setPassword} = require('../controllers/cittadinoController');

router.post('/signup', signUp);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post("/segnalazione", creaSegnalazione);
router.get('/:id', authenticateJWT, getCittadinoByID);
router.put('/addContattiEmergenza/:id', authenticateJWT, addContattoEmergenza);
router.put('/editContattiEmergenza/:id', authenticateJWT, editContattoEmergenza);
router.put('/deleteContattiEmergenza/:id', authenticateJWT, deleteContattoEmergenza);
router.put('/editProfile/:id', authenticateJWT, editProfile);
router.get('/ResendToken/:id', authenticateJWT, reSendConfirmationEmail);
router.get('/getAllSegnalazioni/:id', authenticateJWT, getAllSegnalazioni)
router.post('/recuperaPassword',recuperaPassword)
router.put('/setPassword/:id', setPassword)
module.exports = router;
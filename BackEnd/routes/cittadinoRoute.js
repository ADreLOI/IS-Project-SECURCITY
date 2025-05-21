const express = require('express');
const router = express.Router();
const authenticateJWT  = require('../middleware/jwtCheck');

const { signUp, confirmEmail, login, googleLogin, getCittadinoByID, addContattoEmergenza, deleteContattoEmergenza, editContattoEmergenza, editProfile } = require('../controllers/cittadinoController');

router.post('/signup', signUp);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/:id', authenticateJWT, getCittadinoByID);
router.put('/addContattiEmergenza/:id', authenticateJWT, addContattoEmergenza);
router.put('/editContattiEmergenza/:id', authenticateJWT, editContattoEmergenza);
router.put('/deleteContattiEmergenza/:id', authenticateJWT, deleteContattoEmergenza);
router.put('/editProfile/:id', authenticateJWT, editProfile);

module.exports = router;
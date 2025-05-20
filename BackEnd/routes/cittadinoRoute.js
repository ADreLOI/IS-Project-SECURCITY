const express = require('express');
const router = express.Router();
const authenticateJWT  = require('../middleware/jwtCheck');

const { signUp, confirmEmail, login, googleLogin, getCittadinoByID, addContattoEmergenza } = require('../controllers/cittadinoController');

router.post('/signup', signUp);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/:id', getCittadinoByID);
router.put('/addContattiEmergenza/:id', addContattoEmergenza);

module.exports = router;
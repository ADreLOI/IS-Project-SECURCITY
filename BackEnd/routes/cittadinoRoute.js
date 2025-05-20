const express = require('express');
const router = express.Router();

const { signUp, confirmEmail, login, googleLogin, getCittadinoByID } = require('../controllers/cittadinoController');

router.post('/signup', signUp);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/:id', getCittadinoByID);

module.exports = router;
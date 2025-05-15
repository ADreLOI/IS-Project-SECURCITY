const express = require('express');
const router = express.Router();

const { signUp, confirmEmail } = require('../controllers/cittadinoController');

router.post('/signup', signUp);
router.get('/confirm/:token', confirmEmail);
module.exports = router;
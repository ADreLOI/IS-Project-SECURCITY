const express = require('express');
const router = express.Router();
const { signupOperatore, loginOperatore, confirmEmailOperatore, logoutOperatore } = require('../controllers/operatoreController');

router.post('/signup-operatore', signupOperatore);
router.get("/confirm-operatore/:token", confirmEmailOperatore);
router.post("/login-operatore", loginOperatore);
router.post("/logout-operatore", logoutOperatore);


module.exports = router;

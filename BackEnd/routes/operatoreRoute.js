const express = require('express');
const router = express.Router();
const { signupOperatore, loginOperatore, confirmEmailOperatore, logoutOperatore, getSegnalazione, getAllSegnalazioni, aggiornaStatoSegnalazione, eliminaSegnalazione } = require('../controllers/operatoreController');

router.post('/signup-operatore', signupOperatore);
router.get("/confirm-operatore/:token", confirmEmailOperatore);
router.post("/login-operatore", loginOperatore);
router.post("/logout-operatore", logoutOperatore);
router.get("/segnalazione/:id", getSegnalazione);
router.get("/segnalazioni", getAllSegnalazioni);
router.put("/segnalazione/stato/:id", aggiornaStatoSegnalazione);
router.delete("/segnalazione/delete/:id", eliminaSegnalazione);

module.exports = router;

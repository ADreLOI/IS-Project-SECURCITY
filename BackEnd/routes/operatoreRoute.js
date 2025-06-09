const express = require('express');
const router = express.Router();
const {
  signupOperatore,
  loginOperatore,
  confirmEmailOperatore,
  logoutOperatore,
  getSegnalazione,
  getAllSegnalazioni,
  aggiornaStatoSegnalazione,
  eliminaSegnalazione,
  creaInformazione,
  getAllInformazioni,
  eliminaInformazione,
  getAllItinerari,
  getRandomSensori,
} = require("../controllers/operatoreController");

router.post('/signup-operatore', signupOperatore);
router.get("/confirm-operatore/:token", confirmEmailOperatore);
router.post("/login-operatore", loginOperatore); 
router.post("/logout-operatore", logoutOperatore);
router.get("/segnalazione/:id", getSegnalazione);
router.get("/segnalazioni", getAllSegnalazioni);
router.put("/segnalazione/stato/:id", aggiornaStatoSegnalazione);
router.delete("/segnalazione/delete/:id", eliminaSegnalazione);
router.post("/informazioni", creaInformazione);
router.get("/informazioni", getAllInformazioni);
router.delete("/informazioni/:id", eliminaInformazione);
router.get("/itinerari", getAllItinerari);
router.get("/sensori", getRandomSensori);


module.exports = router;

//Controller per la gestione degli operatori comunali

const OperatoreComunale = require("../models/operatoreComunaleModel");
const ComuneToken = require("../models/comuneTokenModel");
const bcrypt = require("bcryptjs");

const signupOperatore = async (req, res) => {
  try {
    const { username, email, password, tokenComune } = req.body;

    const token = await ComuneToken.findOne({
      value: tokenComune,
      used: false,
    });
    if (!token) {
      return res.status(403).json({ error: "Invalid or already used token." });
    }

    const existingUser = await OperatoreComunale.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email or username already in use." });
    }

    const operatore = new OperatoreComunale({
      username,
      email,
      password,
    });
    await operatore.save();

    token.used = true;
    token.issuedTo = email;

    await ComuneToken.deleteOne({ _id: token._id });

    res
      .status(201)
      .json({ message: "Operatore comunale successfully registered." });
  } catch (error) {
    console.error("❌ Error during operatore registration:", error.message);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};

module.exports = { signupOperatore };

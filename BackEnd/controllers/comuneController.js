const ComuneToken = require("../models/comuneTokenModel");

const generaTokenComune = async (req, res) => {
  const { codiceAdmin } = req.body;
  // Verifies admin password (from .env)
  if (!codiceAdmin || codiceAdmin !== process.env.SECRET_ADMIN_CODE) {
    return res
      .status(403)
      .json({ message: "Codice amministratore non valido." });
  }
  try {
    // Generate token
    const value = `TRNT-OP-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newToken = new ComuneToken({
      value,
      used: false,
    });

    await newToken.save();
 
    return res.status(201).json({
      message: "Token generato con successo.",
      token: value,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return res.status(500).json({ message: "Failed to generate token." });
  }
};

module.exports = { generaTokenComune };

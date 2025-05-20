//Controller per la gestione degli operatori comunali

const OperatoreComunale = require("../models/operatoreComunaleModel");
const ComuneToken = require("../models/comuneTokenModel");
const Token = require("../models/tokenModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendConfirmationEmail } = require("../utils/emailService");

const loginOperatore = async (req, res) => {
  try {
    const { username, password } = req.body;

    const operatore = await OperatoreComunale.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!operatore) {
      return res.status(404).json({ message: "Operator not found." });
    }

    const isPasswordValid = await operatore.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Imposta isAutenticato a true
    operatore.isAutenticato = true;
    await operatore.save();

    const token = jwt.sign(
      { id: operatore._id, email: operatore.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // debug
    console.log("Token generato:", token);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: operatore._id,
        username: operatore.username,
        email: operatore.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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

    // Genera token di conferma email
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const newToken = new Token({
      userID: operatore._id,
      userModel: "OperatoreComunale", // clear indication of the user model
      token: confirmationToken,
      scadenza: Date.now() + 3600000,
    });
    
    await newToken.save();

    // Invia email di conferma
    await sendConfirmationEmail(email, username, confirmationToken);

    token.used = true;
    token.issuedTo = email;
    await ComuneToken.deleteOne({ _id: token._id });

    res.status(201).json({
      message:
        "Operatore comunale successfully registered. Please confirm your email.",
    });
  } catch (error) {
    console.error("❌ Error during operatore registration:", error.message);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};

const confirmEmailOperatore = async (req, res) => {
  try {
    const { token } = req.params;

    // Trova il record del token e popola l'oggetto userID dinamicamente
    const tokenRecord = await Token.findOne({ token }).populate("userID");

    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = tokenRecord.userID;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Aggiorna la flag di verifica
    user.isVerificato = true;
    await user.save();

    // Elimina il token
    await Token.deleteOne({ _id: tokenRecord._id });

    res.status(200).json({ message: "Email confirmed successfully!" });
  } catch (error) {
    console.error("❌ Error confirming email:", error);
    res.status(500).json({ error: error.message });
  }
};

const logoutOperatore = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded user ID:", decoded.id);

    const updated = await OperatoreComunale.findByIdAndUpdate(decoded.id, {
      isAutenticato: false,
    });

    console.log("Updated operator:", updated);

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error during logout" });
  }
};



module.exports = {
  loginOperatore,
  signupOperatore,
  confirmEmailOperatore,
  logoutOperatore,
};

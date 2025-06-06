// Controller for managing municipal operators

const OperatoreComunale = require("../models/operatoreComunaleModel");
const ComuneToken = require("../models/comuneTokenModel");
const Token = require("../models/tokenModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendConfirmationEmail } = require("../utils/emailService");
const Segnalazione = require("../models/segnalazioneModel");
const { status } = require("../models/enumModel");
const { IdentityPoolClient } = require("google-auth-library");
const InfoComunali = require("../models/infoComunaliModel");

// Operator signup handler
const signupOperatore = async (req, res) => {
  try {
    const { username, email, password, tokenComune } = req.body;

    // Validate the municipal token (must exist and be unused)
    const token = await ComuneToken.findOne({
      value: tokenComune,
      used: false,
    });
    if (!token) {
      return res.status(403).json({ error: "Invalid or already used token." });
    }

    // Check if username or email already exists
    const existingUser = await OperatoreComunale.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email or username already in use." });
    }

    // Create new operator
    const operatore = new OperatoreComunale({
      username,
      email,
      password,
    });
    await operatore.save();

    // Generate email confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const newToken = new Token({
      userID: operatore._id,
      userModel: "OperatoreComunale",
      token: confirmationToken,
      scadenza: Date.now() + 3600000, // 1 hour expiration
    });
    await newToken.save();

    // Send confirmation email
    await sendConfirmationEmail(email, username, confirmationToken);

    // Mark the municipal token as used and assign it to the operator
    token.used = true;
    token.issuedTo = email;
    await ComuneToken.deleteOne({ _id: token._id });

    res.status(201).json({
      message: "Operator successfully registered. Please confirm your email.",
    });
  } catch (error) {
    console.error("Error during operator registration:", error.message);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};

// Email confirmation for operators
const confirmEmailOperatore = async (req, res) => {
  try {
    const { token } = req.params;

    // Find the confirmation token and populate the referenced user
    const tokenRecord = await Token.findOne({ token }).populate("userID");

    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = tokenRecord.userID;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark user as verified
    user.isVerificato = true;
    await user.save();

    // Remove the used token
    await Token.deleteOne({ _id: tokenRecord._id });

    res.status(200).json({ message: "Email confirmed successfully!" });
  } catch (error) {
    console.error("Error confirming email:", error);
    res.status(500).json({ error: error.message });
  }
};

// Operator login handler
const loginOperatore = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find operator by username or email
    const operatore = await OperatoreComunale.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!operatore) {
      return res.status(404).json({ message: "Operator not found." });
    }

    // Verify password
    const isPasswordValid = await operatore.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set isAutenticato flag to true
    operatore.isAutenticato = true;
    await operatore.save();

    // Generate JWT
    const token = jwt.sign(
      { id: operatore._id, email: operatore.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("Generated token:", token);

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

// Logout handler: reset isAutenticato flag
const logoutOperatore = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set isAutenticato to false
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

// GET a single report by ID
const getSegnalazione = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure ID is provided
    if (!id) {
      return res.status(400).json({ message: "Missing segnalazione ID." });
    }

    // Find the report
    const segnalazione = await Segnalazione.findById(id);

    if (!segnalazione) {
      return res.status(404).json({ message: "Segnalazione not found." });
    }

    // Return the report
    return res.status(200).json(segnalazione);
  } catch (error) {
    console.error("Error fetching segnalazione:", error);
    return res.status(500).json({ message: "Server error fetching segnalazione." });
  }
};

// GET all user-reported reports (for Operatore Comunale)
const getAllSegnalazioni = async (req, res) => {
  try {
    // Fetch all reports sorted by most recent first
    const segnalazioni = await Segnalazione.find().sort({ data: -1 });

    return res.status(200).json(segnalazioni);
  } catch (error) {
    console.error("Error fetching segnalazioni:", error);
    return res.status(500).json({ message: "Unable to retrieve segnalazioni." });
  }
};

// Update the status of a specific user report
const aggiornaStatoSegnalazione = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuovoStato } = req.body;
    // Validate the request body
    if (!id || !nuovoStato) {
      return res.status(400).json({ message: "Missing ID or new status." });
    }

    // Validate the new status
    if (!Object.values(status).includes(nuovoStato)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the report by ID and update its status
    const updated = await Segnalazione.findByIdAndUpdate(
      id,
      { status: nuovoStato },
      { new: true }
    );

    // Check if the report was found and updated
    if (!updated) {
      return res.status(404).json({ message: "Segnalazione not found." });
    }

    return res.status(200).json({
      message: "Segnalazione updated successfully.",
      segnalazione: updated,
    });
  } catch (error) {
    console.error("Errore aggiornamento stato:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating segnalazione status." });
  }
};

// DELETE controller for removing a specific report by ID
const eliminaSegnalazione = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "Missing report ID." });
    }

    // Try to delete the report by its ID
    const deleted = await Segnalazione.findByIdAndDelete(id);

    // If not found, return error
    if (!deleted) {
      return res.status(404).json({ message: "Segnalazione not found." });
    }

    // Return success response
    return res.status(200).json({
      message: "Segnalazione successfully deleted.",
      segnalazione: deleted,
    });
  } catch (error) {
    console.error("Error deleting segnalazione:", error);
    return res.status(500).json({
      message: "Server error while deleting the segnalazione.",
    });
  }
};

const creaInformazione = async (req, res) => {
  try 
    {
      const { userID, informazione, tappa, gradoSicurezzaAssegnato } = req.body;

      const nuovaInfo = new InfoComunali({
        userID,
        informazione,
        tappa,
        gradoSicurezzaAssegnato
      });

      const salvata = await nuovaInfo.save();
      res.status(201).json(salvata);
    } catch (err) {
      console.error("Errore creazione info comunale:", err);
      res.status(400).json({ error: err.message });
    }
};

const getAllInformazioni = async (req, res) => {
  try {
    const informazioni = await InfoComunali.find();
    res.status(200).json(informazioni);
  } catch (err) {
    console.error("Errore nel recupero delle informazioni comunali:", err);
    res.status(500).json({error: "Errore server nel recupero delle informazioni."});
  }
}

module.exports = {
  loginOperatore,
  signupOperatore,
  confirmEmailOperatore,
  logoutOperatore,
  getSegnalazione,
  getAllSegnalazioni,
  aggiornaStatoSegnalazione,
  eliminaSegnalazione,
  creaInformazione,
  getAllInformazioni
};

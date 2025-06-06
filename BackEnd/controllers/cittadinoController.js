//Controller per la gestione dei cittadini
const Cittadino = require("../models/cittadinoModel");
const {
  sendConfirmationEmail,
  sendEmailChange,
  sendEmailPassword,
} = require("../utils/emailService");
const Token = require("../models/tokenModel");
const Segnalazione = require("../models/segnalazioneModel");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const authenticateJWT = require("../middleware/jwtCheck");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const signUp = async (req, res) => {
  try {
    // Check if the user already exists
    const existingUser = await Cittadino.find({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    const cittadino = await Cittadino.create(req.body);
    // Generate a confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    // Save the token in the database (you might want to create a separate model for this)
    const token = new Token({
      userID: cittadino._id,
      userModel: "Cittadino", // chiaro riferimento dinamico
      token: confirmationToken,
      scadenza: Date.now() + 3600000,
    });

    await token.save();
    // Send confirmation email
    await sendConfirmationEmail(
      cittadino.email,
      cittadino.username,
      confirmationToken
    );

    res.status(200).json({
      cittadino: cittadino,
      message:
        "Registration successful! Please check your email to confirm your account.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Trova il record del token e popola l'oggetto userID dinamicamente
    const tokenRecord = await Token.findOne({ token }).populate("userID");

    if (!tokenRecord) 
    {
      return res.status(400).json({ message: "Invalid token" });
    }

    if(tokenRecord.scadenza < Date.now()) 
    {
      return res.status(400).json({ message: "Token has expired" });
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

const creaSegnalazione = async (req, res) => 
  {
  try 
  {
    const nuovaSegnalazione = await Segnalazione.create(req.body)
    res.status(201).json(nuovaSegnalazione);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try 
  {
    const { username, password } = req.body;

    const cittadino = await Cittadino.findOne({
      $or: [{ username: username }, { email: username }],
    });
    console.log(cittadino);

    const isMatch = await cittadino.comparePassword(password);

    if (isMatch) 
    {
      console.log("Password is correct");
      // Create JWT
      const token = jwt.sign(
        { id: cittadino._id, email: cittadino.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      // Set the token in the response
      return res.status(200).json({ message: "Login successful", token, user: cittadino });

    }
     else 
    {
        console.log("Password is not correct");
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) 
  {
    console.log("Some error");
    res.status(500).json({ error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const payload = await verifyGoogleToken(idToken);
    const { email, name, picture, sub: googleId } = payload;
    //Check if the user is already registered
    let cittadino = await Cittadino.findOne({ email });

    if (!cittadino) {
      // If not, create a new user

      //
      const cleaned = name.replace(/\s+/g, "");
      console.log(cleaned);
      cittadino = await Cittadino.create({
        username: cleaned,
        email,
        password: "none",
        isVerificato: true,
        isGoogleAutenticato: true,
        googleId,
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: cittadino._id, email: cittadino.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set the token in the response
    res.status(200).json({ message: "Login successful", token, user: cittadino });
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCittadinoByID = async (req, res) => {
  try {
    //Check beare token for authorization!!
    // Get the user ID from the request parameters
    const { id } = req.params;
    const cittadino = await Cittadino.findById(id);
    if (!cittadino) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(cittadino);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

const addContattoEmergenza = async (req, res) => {
  try {
    //FindById and update
    //Check beare token for authorization!!

    const { id } = req.params;
    console.log(req.body);
    const cittadino = await Cittadino.findByIdAndUpdate(id, req.body);
    if (!cittadino) {
      res.status(404).json({ message: "The user doesn't exist" });
    } else {
      const updatedCittadino = await Cittadino.findById(id);
      res.status(200).json(updatedCittadino);
      console.log("User updated with new contatti di emergenza");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editContattoEmergenza = async (req, res) => {
  try {
    const { id } = req.params; // id of the cittadino
    const { contattoId, nominativo, numeroTelefonico } = req.body;
    console.log(req.body);

    const cittadino = await Cittadino.findOneAndUpdate(
      { _id: id, "contattiEmergenza._id": contattoId },
      {
        $set: {
          "contattiEmergenza.$.nominativo": nominativo,
          "contattiEmergenza.$.numeroTelefonico": numeroTelefonico,
        },
      },
      { new: true }
    );

    if (!cittadino) {
      res.status(404).json({ message: "Il contatto non esiste!" });
    } else {
      const updatedCittadino = await Cittadino.findById(id);
      res.status(200).json(updatedCittadino);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editProfile = (async = async (req, res) => {
  try 
  {
    const { id } = req.params; // id of the cittadino
    const cittadino = await Cittadino.findByIdAndUpdate(id, req.body);

    if (!cittadino) {
      res.status(404).json({ message: "The user doesn't exist" });
    } else {
      //If email changed send a new verification link
      if (req.body.email != cittadino.email) {
        console.log("HA cambiato email");
        // Generate a confirmation token
        const confirmationToken = crypto.randomBytes(32).toString("hex");
        // Save the token in the database (you might want to create a separate model for this)
        const token = new Token({
          userID: cittadino._id,
          token: confirmationToken,
          scadenza: Date.now() + 3600000, // Token valid for 1 hour
        });
        await token.save();
        // Send confirmation email
        await sendEmailChange(
          req.body.email,
          req.body.username,
          confirmationToken
        );

        const updatedCittadino = await Cittadino.findById(id);
        //Set isVerificatoFlag to false until confirmation
        updatedCittadino.isVerificato = false;
        await updatedCittadino.save();
        res.status(200).json(updatedCittadino);
        console.log("User update with a new email");
      } else {
        const updatedCittadino = await Cittadino.findById(id);
        res.status(200).json(updatedCittadino);
        console.log("User update with new username");
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const deleteContattoEmergenza = async (req, res) => {
  try {
    //FindById and delete
    //Check beare token for authorization!!
    const { id } = req.params;
    console.log(req.body);

    const cittadino = await Cittadino.findByIdAndUpdate(
      id,
      { $pull: { contattiEmergenza: { _id: req.body.idContatto } } },
      { new: true }
    );
    if (!cittadino) {
      res.status(404).json({ message: "The user doesn't exist" });
    } else {
      const updatedCittadino = await Cittadino.findById(id);
      res.status(200).json(updatedCittadino);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload(); // contains email, name, sub, picture, etc.
}

const reSendConfirmationEmail = async (req, res) => 
  {
    try 
    {
      const { id } = req.params; // id of the cittadino
      // Find the user by ID
      const cittadino = await Cittadino.findById(id);
      if (!cittadino) 
      {
        return res.status(404).json({ message: "User not found" });
      }
      // Generate a confirmation token
      const confirmationToken = crypto.randomBytes(32).toString("hex");
      // Save the token in the database (you might want to create a separate model for this)
      const token = new Token({
        userID: cittadino._id,
        userModel: "Cittadino", // chiaro riferimento dinamico
        token: confirmationToken,
        scadenza: Date.now() + 3600000,
      });

      await token.save();
      // Send confirmation email
      await sendConfirmationEmail(
        cittadino.email,
        cittadino.username,
        confirmationToken
      );

      res.status(200).json({
        cittadino: cittadino,
        message:
          "Registration successful! Please check your email to confirm your account.",
      });

    } catch (error) { 
      console.error("Error resending confirmation email:", error);
      res.status(500).json({ error: error.message });
    } 
}

const getAllSegnalazioni = async (req, res) =>
{
  //get all segnalazionis of a cittadino
  try
  {
    const { id } = req.params;
    
    const segnalazioni = await Segnalazione.find({ userID: id})

    if (segnalazioni.length == 0)
    {
      res.status(404).json({message: "Questo utente non ha effettuato segnalazioni!"})
    }
    else
    {
      console.log("Segnalazioni trovate")
      res.status(200).json({segnalazioniUtente: segnalazioni})
    }
  }
  catch(error)
  {
    console.error("Error in segnalazioni:", error);
    res.status(500).json({ error: error.message });
  }
}

const recuperaPassword = async (req, res) =>
{
  //Define the process to start the recover of password, for google authentication is not required!
  try
  {
    //Username or email
      const { username } = req.body;
      console.log("Username", username)
    const cittadino = await Cittadino.findOne({
      $or: [{ username: username }, { email: username }],
    });

      if(!cittadino)
      {
        res.status(404).json({message: "User not found"})
      }
      else
      {
        if(cittadino.isGoogleAutenticato)
        {
          res.status(401).json({message: "Google authenticated users must manage their passwords in their Google accounts!"})
        }
        //Can send mail
        await sendEmailPassword(cittadino.email, cittadino.username, cittadino._id)
        res.status(200).json({message: "Email sent successfully! Please check your email to change or recover you password."})
      }
  }
  catch (error)
  {
    console.error("Error:", error);
    res.status(500).json({message: error.message})
  }
}
const setPassword = async (req, res) =>
{
  try
  {
    const { id } = req.params
    const {password} = req.body

    //Hash before updating
    const salt = await bcrypt.genSalt(10); // Adjust cost factor as needed
    const newPassword = await bcrypt.hash(password, salt);


    const cittadino = await Cittadino.findByIdAndUpdate(
      id,                          // The ID of the document to update
      { password: newPassword }, // Fields to update
      { new: true }                // Return the updated document
    );

    if(!cittadino)
    {
      //console.log("Not found")
      res.status(404).json({message: "User don't found"})
    }
    else
    {
      //Return to the app!
      //console.log("All good", cittadino.password)
      res.status(200).json({message: "You can now go back to the mobile app!"})
    }
  }
  catch(error)
  {
    console.error(error)
    res.status(500).json({message: error.message})
  }
}

// Export the functions to be used in the routes
module.exports = 
{
  signUp,
  confirmEmail,
  login,
  googleLogin,
  creaSegnalazione,
  getCittadinoByID,
  addContattoEmergenza,
  editContattoEmergenza,
  deleteContattoEmergenza,
  editProfile,
  reSendConfirmationEmail,
  getAllSegnalazioni,
  recuperaPassword,
  setPassword
};

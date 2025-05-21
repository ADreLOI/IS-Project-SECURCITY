//Controller per la gestione dei cittadini
const Cittadino = require('../models/cittadinoModel');
const { sendConfirmationEmail } = require('../utils/emailService');
const Token = require('../models/tokenModel');
const Segnalazione = require('../models/segnalazioneModel');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require('jsonwebtoken');

const signUp = async (req, res) => 
{  
    try 
    {
        // Check if the user already exists
        console.log("Qualcosa")
        const existingUser = await Cittadino.find   
        ({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        });
        if (existingUser.length > 0)
        {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        const cittadino = await Cittadino.create(req.body);
        // Generate a confirmation token
        const confirmationToken = crypto.randomBytes(32).toString('hex');
        // Save the token in the database (you might want to create a separate model for this)  
        const token = new Token({
            userID: cittadino._id, 
            token: confirmationToken,
            scadenza: Date.now() + 3600000, // Token valid for 1 hour
        });
        await token.save();
        // Send confirmation email
        await sendConfirmationEmail(cittadino.email, cittadino.username, confirmationToken);

        res.status(200).json({cittadino: cittadino, message: 'Registration successful! Please check your email to confirm your account.'});

    } catch (error) 
    {
        res.status(500).json({ error: error.message });
    } 
}

const confirmEmail = async (req, res) => 
{
    try 
    {
        const { token } = req.params;
        console.log(token);
        // Find the token in the database and check if it's valid
        const tokenRecord = await Token.findOne({ token });
        if (!tokenRecord) 
        {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Confirm the user's email
        const user = await Cittadino.findById(tokenRecord.userID);
        user.isVerificato = true;
        await user.save();
 
        // Delete the token from the database
        await Token.deleteOne({ _id: tokenRecord._id });

        res.status(200).json({ message: 'Email confirmed successfully!' });
    } catch (error) 
    {
        res.status(500).json({ error: error.message });
    }
}

const creaSegnalazione = async (req, res) => {
  try {
    const nuovaSegnalazione = new Segnalazione(req.body);
    await nuovaSegnalazione.save();
    res.status(201).json(nuovaSegnalazione);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) =>   
{
    try 
    {
        const { username, password } = req.body;
        
        const cittadino = await Cittadino.findOne(
        {
            $or: [
              { username: username },
              { email: username }
            ]
          });
          console.log(cittadino);

        if(cittadino.comparePassword(password))
        {
            console.log("Password is correct");
              // Create JWT
              const token = jwt.sign
              (
                  { id: cittadino._id, email: cittadino.email },
                  process.env.JWT_SECRET,
                  { expiresIn: '7d' }
              );
            // Set the token in the response
            return res.status(200).json({message: 'Login successful',token, user: Cittadino});
        }   
        else
        {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

    }
    catch (error) 
    {
        res.status(500).json({ error: error.message });
    }
}

const googleLogin = async (req, res) => 
{
    try
    {
        const { idToken } = req.body;
        const payload = await verifyGoogleToken(idToken);
        const { email, name, picture, sub: googleId } = payload;
        //Check if the user is already registered
        let cittadino = await Cittadino.findOne({ email });

        if(!cittadino)
        {
            // If not, create a new user

            //
            const cleaned = name.replace(/\s+/g, '');
            console.log(cleaned);
            cittadino = await Cittadino.create({
                username: cleaned,
                email,
                password: "none",
                isVerificato: true,
                isGoogleAutenticato: true,
                googleId
            });
        }

         // Create JWT
            const token = jwt.sign
            (
                { id: cittadino._id, email: cittadino.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

        // Set the token in the response
        res.status(200).json({ message: 'Login successful', token, user: cittadino });
  
    }   
    catch (error) 
    {
        console.error('Error during Google login:', error);
        res.status(500).json({ error: error.message });
    }
}

async function verifyGoogleToken(idToken) 
{
    const ticket = await client.verifyIdToken(
    {
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload(); // contains email, name, sub, picture, etc.
}

// Export the functions to be used in the routes
module.exports =
{
    signUp,
    confirmEmail,
    login,
    googleLogin,
    creaSegnalazione
}
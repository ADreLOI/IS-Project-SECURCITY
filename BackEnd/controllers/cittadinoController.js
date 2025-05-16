//Controller per la gestione dei cittadini
const Cittadino = require('../models/cittadinoModel');
const { sendConfirmationEmail } = require('../utils/emailService');
const Token = require('../models/tokenModel');
const crypto = require('crypto');

const signUp = async (req, res) => 
{  
    try 
    {
        // Check if the user already exists
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

module.exports =
{
    signUp,
    confirmEmail
}
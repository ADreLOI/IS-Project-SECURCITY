//Controller per la gestione dei cittadini


const Cittadino = require('../models/cittadinoModel');


const signUp = async (req, res) => {  
    const { username, email, password } = req.body;

    try 
    {
        const newCittadino = new Cittadino({ username, email, password });
        await newCittadino.save();
        res.status(201).json({ message: 'Cittadino created successfully', cittadino: newCittadino });
    } catch (error) 
    {
        res.status(400).json({ error: error.message });
    }
}
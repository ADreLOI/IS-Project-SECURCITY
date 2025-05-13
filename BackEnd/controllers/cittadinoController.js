//Controller per la gestione dei cittadini
const Cittadino = require('../models/cittadinoModel');


const signUp = async (req, res) => 
{  
    try 
    {
        const cittadino = await Cittadino.create(req.body);
        res.status(200).json(cittadino);
    } catch (error) 
    {
        res.status(500).json({ error: error.message });
    }
}

module.exports =
{
    signUp
}
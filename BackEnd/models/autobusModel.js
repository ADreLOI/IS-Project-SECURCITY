const mongoose = require("mongoose");

const autobusSchema = new mongoose.Schema
({
    linea:
    {
        type: String,
        required: true
    },
    fermate:
    {
        type: [String],
        required: true
    },
    calendario: //Scolastico o Estivo/Festivo
    {
        type: String,
        required: true
    },
    orari:
    {
        type: [String],
        required: true
    }
});

const Autobus = mongoose.model('Autobus', autobusSchema);
module.exports = Autobus;
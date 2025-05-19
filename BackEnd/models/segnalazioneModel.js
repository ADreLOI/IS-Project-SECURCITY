const mongoose = require("mongoose");
const {reati, status } = require("./enumModel");
const { tappaSchema } = require("./tappaModel");


// Define Segnalazioni schema
const segnalazioniSchema = new mongoose.Schema(
    {
        userID:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cittadino',
            required: false //Va cambiato a true
        },
        tipoDiReato: 
        {
            type: String,
            enum: Object.values(reati),
            required: true
        },
        descrizione: 
        {
            type: String,
            required: true
        },
        tappa: 
        {
            type: tappaSchema,
            required: true
        },
        status: 
        {
            type: String,
            enum: Object.values(status),
            default: status.PENDENTE
        },
        data:
        {
            type: Date,
            default: Date.now,
            validate: 
            {
                validator: function (v) 
                {
                    return v <= Date.now();
                },
                message: props => `${props.value} is not a valid date!`
            }
        },
    }
)

const Segnalazione = mongoose.model('Segnalazione', segnalazioniSchema);
module.exports = Segnalazione;
const mongoose = require("mongoose");
const {gradoSicurezza} = require("./enumModel");

const { autobusSchema } = require("./autobusModel");
const { eserciziCommercialiSchema } = require("./eserciziCommercialiModel");
const { taxiReperibiliSchema } = require("./taxiModel");
const { casermeForzeOrdineSchema } = require("./casermeForzeOrdineModel");
const { infoComunaliSchema } = require("./infoComunaliModel");
const { tappaSchema } = require("./tappaModel");

const itinerarioSchema = new mongoose.Schema
(
    {
        tappe:
        {
            type: [tappaSchema],
            required: true,
            validate:
            {
                validator: function (value) {
                    return value.length > 1;
                },
                message: props => `L'itinerario deve contenere almeno due tappe (partenza e destinazione)!`
            }
        },
        autobus:
        {
            type: [autobusSchema],
            default: [],
        },
        eserciziCommerciali:
        {
            type: [eserciziCommercialiSchema],
            required: false,
        },
        taxiReperibili:
        {
            type: [taxiReperibiliSchema],
            default: [],
        },
        casermeForzeOrdine:
        {
            type: [casermeForzeOrdineSchema],
            required: false,
        },
        infoComunali:
        {
            type: [infoComunaliSchema],
            default: []
        },
        gradoSicurezzaTotale:
        {
            type: String,
            enum: Object.values(gradoSicurezza),
            required: false,
        }
    }
);

const Itinerario = mongoose.model('Itinerario', itinerarioSchema);
module.exports = Itinerario;

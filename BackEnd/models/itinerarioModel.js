const mongoose = require("mongoose");
const {gradoSicurezza} = require("./enumModel");

const { autobusSchema } = require("./autobusModel");
const { eserciziCommercialiSchema } = require("./eserciziCommercialiModel");
const { taxiReperibiliSchema } = require("./taxiModel");
const { casermeForzeOrdineSchema } = require("./casermeForzeOrdineModel");
const { infoComunaliSchema } = require("./infoComunaliModel");

const tappaSchema = new mongoose.Schema
(
    {
        nome:
        {
            type: String,
            required: true
        },
        coordinate:
        {
            type: [Number],
            required: true,
            validate: {
                validator: function (arr) {
                  return (
                    Array.isArray(arr) &&
                    arr.length === 2 &&
                    arr.every((num) => typeof num === 'number') &&
                    arr[0] >= -180 && arr[0] <= 180 && // Longitude
                    arr[1] >= -90 && arr[1] <= 90     // Latitude
                  );
                },
                message: props => `${props.value} is not a valid [longitude, latitude] pair!`
              }
        }
    }
)

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
            required: true,
        },
        taxiReperibili:
        {
            type: [taxiReperibiliSchema],
            default: [],
        },
        casermeForzeOrdine:
        {
            type: [casermeForzeOrdineSchema],
            required: true,
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
            required: true,
        }
    }
);

const Itinerario = mongoose.model('Itinerario', itinerarioSchema);
module.exports = Itinerario;

const Tappa = mongoose.model('Tappa', tappaSchema);
module.exports = Tappa;
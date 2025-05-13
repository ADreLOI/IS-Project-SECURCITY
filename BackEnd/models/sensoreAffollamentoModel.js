const mongoose = require('mongoose');

// Define the Sensore schema
const sensoreSchema = new mongoose.Schema(
    {
        coordinate:
        {
            type: [Number],
            required: true
        },
        location:
        {
            type: String,
            required: true
        },
        affollamentoCalcolato:
        {
            type: Number,
            default: 0
        },
        data:
        {
            type: Date,
            default: Date.now,
            validator: function (v) 
            {
                return v <= Date.now();
            },
            message: props => `${props.value} is not a valid date!`
        }
    }
);

const Sensore = mongoose.model('Sensore', sensoreSchema);
module.exports = Sensore;
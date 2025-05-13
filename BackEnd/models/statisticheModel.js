const mongoose = require('mongoose');
const { tappaSchema } = require('./itinerarioModel');
const { segnalazioniSchema } = require('./segnalazioneModel');

//Define the Statistiche schema
const statisticheSchema = new mongoose.Schema(
    {
        tappe:
        {
            type: [tappaSchema],
            default: []
        },
        segnalazioni:
        {
            type: [segnalazioniSchema],
            default: []
        },
        data:
        {
            type: Date,
            default: Date.now,
            validate: {
                validator: function (v) 
                {
                    return v <= Date.now();
                },
                message: props => `${props.value} is not a valid date!`
            }
        }
    });

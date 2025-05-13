const mongoose = require('mongoose');

const taxiReperibiliSchema = new mongoose.Schema
({
    nome:
    {
        type: String,
        required: true
    },
    numeriTelefononici:
    {
        type: [String],
        required: true,
        validate: 
        {
            validator: function (value) {
                // Basic phone number regex
                return /^\+?[0-9]{7,15}$/.test(value);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    coordinate:
    {
        type: [Number],
        required: true,
        validate: 
        {
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
})

const taxiReperibili = mongoose.model('TaxiReperibili', taxiReperibiliSchema); 
module.exports = taxiReperibili;
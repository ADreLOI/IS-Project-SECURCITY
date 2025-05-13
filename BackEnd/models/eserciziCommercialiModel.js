const mongoose = require('mongoose');

const eserciziCommercialiSchema = new mongoose.Schema
({
    nome:
    {
        type: String,
        required: true
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
    },
    tipologia:
    {
        type: String,
        required: true
    },
    orari:
    {
        type: [String],
        required: true,
        validate: 
        {
            validator: function (arr) 
            {
              return arr.every((str) =>
                /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/.test(str)
              );
            },
            message: 'Time format should be HH:MM-HH:MM (e.g. "09:00-18:00")'
        }
    }
});
const EserciziCommerciali = mongoose.model('EserciziCommerciali', eserciziCommercialiSchema);
module.exports = EserciziCommerciali;
const mongoose = require('mongoose');

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

const Tappa = mongoose.model('Tappa', tappaSchema);
module.exports = Tappa;
module.exports.tappaSchema = tappaSchema;
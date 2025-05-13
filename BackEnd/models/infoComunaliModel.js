const mongoose = require('mongoose');
const { tappaSchema } = require('./tappaModel');
const { gradoSicurezza } = require('./enumModel');

const infoComunaliSchema = new mongoose.Schema
({
    userID:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OperatoreComunale',
        required: true
    },
    informazione:
    {
        type: String,
        required: true
    },
    tappa:
    {
        type: tappaSchema,
        required: true
    },
    gradoSicurezzaAssegnato:
    {
        type: String,
        enum: Object.values(gradoSicurezza)
    }
});
const InfoComunali = mongoose.model('InfoComunali', infoComunaliSchema);
module.exports = InfoComunali;
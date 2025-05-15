const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
{
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cittadino",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    scadenza: {
        type: Date,
        required: true,
    },  
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
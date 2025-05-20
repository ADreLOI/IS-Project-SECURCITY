const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "userModel", // dynamic reference to the user model
  },
  userModel: {
    type: String,
    required: true,
    enum: ["Cittadino", "OperatoreComunale"], // supporting multiple user models
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
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// Import other models
const { segnalazioniSchema } = require("./segnalazioneModel");
const { statisticheSchema } = require("./statisticheModel");
const { sensoriAffollamento } = require("./sensoreAffollamentoModel");

// Define the User(Operatore comunale) schema
const operatoreComunaleSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        // Basic username regex
        return /^[a-zA-Z0-9_]{3,20}$/.test(value);
      },
      message: (props) => `${props.value} is not a valid username!`,
    },
  },
  email: {
    type: String,
    required: true,
    //Force email to be unique of all documents
    unique: true,
    validate: {
      validator: function (value) {
        // Basic email regex
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Esegui la regex solo se la password è stata modificata (cioè è in chiaro)
        if (this.isModified("password")) {
          return /^.{8,32}$/.test(value);
        }
        return true; // altrimenti considera valido (già hashata)
      },
      message: (props) =>
        `${props.value} is not a valid password (must be between 8 and 32 characters)!`,
    },
  },
  isVerificato: {
    type: Boolean,
    default: false,
  },
  isAutenticato: {
    type: Boolean,
    default: false,
  },
  storicoUtenti: {
    type: [segnalazioniSchema],
    default: [],
  },
  datiStatistici: {
    type: [statisticheSchema],
    default: [],
  },
  sensoriAffollamento: {
    type: [sensoriAffollamento],
    default: [],
  },
});

// Pre-save hook to hash password before saving
operatoreComunaleSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10); // Adjust cost factor as needed
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
operatoreComunaleSchema.methods.comparePassword = async function (candidatePassword) 
{
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create a model from the schema
const OperatoreComunale = mongoose.model(
  "OperatoreComunale",
  operatoreComunaleSchema
);
// Export the model
module.exports = OperatoreComunale;

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import related schemas
const { segnalazioniSchema } = require("./segnalazioneModel");
const { statisticheSchema } = require("./statisticheModel");
const { sensoriAffollamento } = require("./sensoreAffollamentoModel");

// Define schema for Operatore Comunale (Municipal Operator)
const operatoreComunaleSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        // Accepts alphanumeric usernames with underscores, between 3 and 20 characters
        return /^[a-zA-Z0-9_]{3,20}$/.test(value);
      },
      message: (props) => `${props.value} is not a valid username!`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    validate: {
      validator: function (value) {
        // Basic email format validation
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
        // Apply regex only if password is new (in plain text)
        if (this.isModified("password")) {
          return /^.{8,32}$/.test(value);
        }
        return true; // Skip if already hashed
      },
      message: (props) =>
        `${props.value} is not a valid password (must be between 8 and 32 characters)!`,
    },
  },
  isVerificato: {
    type: Boolean,
    default: false, // Indicates whether the email was confirmed
  },
  isAutenticato: {
    type: Boolean,
    default: false, // Tracks active login state
  },
  storicoUtenti: {
    type: [segnalazioniSchema], // Embedded user-reported issues
    default: [],
  },
  datiStatistici: {
    type: [statisticheSchema], // Embedded statistical data
    default: [],
  },
  sensoriAffollamento: {
    type: [sensoriAffollamento], // Embedded crowd sensor data
    default: [],
  },
});

// Automatically hash password before saving, only if modified
operatoreComunaleSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10); // Adjust complexity if needed
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare a plain-text password with the hashed one
operatoreComunaleSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const OperatoreComunale = mongoose.model(
  "OperatoreComunale",
  operatoreComunaleSchema
);
module.exports = OperatoreComunale;

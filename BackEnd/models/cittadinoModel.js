const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
// Import other models
const { segnalazioniSchema } = require("./segnalazioneModel");
const { itinerarioSchema } = require("./itinerarioModel");

const contattoEmergenzaSchema = new mongoose.Schema(
    {
        nominativo:
        {
            type: String,
            required: true,           
        },
        numeroTelefonico:
        {
            type: String,
            required: true,
            validate: 
            {
                validator: function (value) {
                    // Basic phone number regex
                    return /^\+?[0-9]{7,15}$/.test(value);
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        }
    }
);

//Define the user schema (Cittadino)
const cittadinoSchema = new mongoose.Schema({
    username: 
    {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
              // Basic username regex
              return /^[a-zA-Z0-9_]{3,20}$/.test(value);
            },
            message: props => `${props.value} is not a valid username!`
          }
    },
    email: 
    {
        type: String,
        required: true,
        //Force email to be unique of all documents
        unique: true,
        validate: 
        {
            validator: function (value) {
              // Basic email regex
              return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: 
    {
        type: String,
        required: true,
    },
    isVerificato: 
    {
        type: Boolean,
        default: false
    },
    isAutenticato: 
    {
        type: Boolean,
        default: false
    },
    storico:
    {
        type: [segnalazioniSchema],
        default: []
    },
    itinerariPreferiti:
    {
        type: [itinerarioSchema],
        default: []
    },
    contattiEmergenza:
    {
        type: [contattoEmergenzaSchema],
        default: [],
    }
});

// Pre-save hook to hash password before saving
cittadinoSchema.pre('save', async function (next) 
{
  if (!this.isModified('password')) return next();
  try
  {
    const salt = await bcrypt.genSalt(10); // Adjust cost factor as needed
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
cittadinoSchema.methods.comparePassword = async function (candidatePassword) 
{
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create a model from the schema
const Cittadino = mongoose.model('Cittadino', cittadinoSchema);
// Export the model
module.exports = Cittadino;
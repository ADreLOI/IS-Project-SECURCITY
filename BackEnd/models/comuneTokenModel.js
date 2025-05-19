const mongoose = require("mongoose");

const comuneTokenSchema = new mongoose.Schema(
{
  value: {
    type: String,
    required: true,
    unique: true
  },
  used: {
    type: Boolean,
    default: false
  },
  issuedTo: {
    type: String // optional: email or info about who go it
  }, 
  createdAt: {
    type: Date,
    default: Date.now
    },
  expiresAt: {
    type: Date,
    default: Date.now() + 60 * 60 * 1000, // Default to 1 hour from now
    required: true
  }
});

// Create a TTL index. Create a TTL index on the expiresAt field to automatically delete documents after the specified time.
comuneTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ComuneToken", comuneTokenSchema);

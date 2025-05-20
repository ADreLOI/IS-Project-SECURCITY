require("dotenv").config();
const mongoose = require('mongoose');
const ComuneToken = require('../models/comuneTokenModel'); // usa il path corretto se diverso

async function generateToken() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate token value (e.g., TRNT-OP-2025-XYZ)
    const value = `TRNT-OP-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newToken = new ComuneToken({
      value,
      used: false
    });

    await newToken.save();

    console.log(`✅ Comune token generated: ${value}`);
    process.exit();
  } catch (err) {
    console.error('❌ Error generating token:', err);
    process.exit(1);
  }
}

generateToken();

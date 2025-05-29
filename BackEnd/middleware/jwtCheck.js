const jwt = require('jsonwebtoken');
const OperatoreComunale = require('../models/operatoreComunaleModel.js');
const Cittadino = require("../models/cittadinoModel.js");

// Middleware to verify JWT and protect routes
const authenticateJWT = async (req, res, next) => {
  // Debug: Log the authorization header
  console.log("Authorization header:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  // Check if token is present and properly formatted
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user payload to the request
    req.user = decoded;
    return next();
  } catch (err) {
    // If verification fails, decode manually and reset isAutenticato
    try {
      const decodedPayload = jwt.decode(token);

      if (decodedPayload?.id) {
        await OperatoreComunale.findByIdAndUpdate(decodedPayload.id, {
          isAutenticato: false,
        });
      }
    } catch (innerErr) {
      console.error("Error resetting isAutenticato:", innerErr);
    }

    return res.status(403).json({ message: "Token is invalid or expired" });
  }
};

module.exports = authenticateJWT
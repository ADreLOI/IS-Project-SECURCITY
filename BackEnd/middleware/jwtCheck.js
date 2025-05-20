import jwt from "jsonwebtoken";
import OperatoreComunale from "../models/operatoreComunaleModel.js"; // Assicurati dell'estensione corretta

export const authenticateJWT = async (req, res, next) => {
  //debug
  console.log("Authorization header:", req.headers.authorization);


  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user data
    return next();
  } catch (err) {
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

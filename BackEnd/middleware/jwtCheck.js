const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try 
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user data
    console.log("Decoded JWT:", decoded);
    next();
  } catch (err) 
  {
    return res.status(403).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = authenticateJWT;
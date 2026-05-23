const admin = require("../config/firebase");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    // attach user to request
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized - Invalid token",
    });
  }
};

module.exports = { authenticate };
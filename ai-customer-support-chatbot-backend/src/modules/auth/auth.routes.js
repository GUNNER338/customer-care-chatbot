const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const authController = require("./auth.controller");

const router = express.Router();

router.post("/register", authenticate, authController.register);
router.get("/me", authenticate, authController.getMe);

module.exports = router;

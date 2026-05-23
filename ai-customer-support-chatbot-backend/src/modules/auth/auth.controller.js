const authService = require("./auth.service");

class AuthController {
  async register(req, res, next) {
    try {
      const { fullName } = req.body;
      const { uid, email } = req.user;

      const result = await authService.registerUser({
        firebaseUid: uid,
        email,
        fullName,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const { uid } = req.user;
      const user = await authService.getUserProfile(uid);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

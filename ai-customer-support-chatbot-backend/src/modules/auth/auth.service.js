const authRepository = require("./auth.repository");

class AuthService {
  async registerUser(userData) {
    const { firebaseUid, email, fullName } = userData;

    // Check if user already exists
    let user = await authRepository.findByFirebaseUid(firebaseUid);

    if (!user) {
      // Create user if they don't exist
      user = await authRepository.create({
        firebaseUid,
        email,
        fullName,
      });
    }

    return user;
  }

  async getUserProfile(firebaseUid) {
    return await authRepository.findByFirebaseUid(firebaseUid);
  }
}

module.exports = new AuthService();

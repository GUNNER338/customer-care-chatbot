const prisma = require("../../config/prisma");

class AuthRepository {
  async findByFirebaseUid(firebaseUid) {
    return prisma.user.findUnique({
      where: {
        firebaseUid,
      },
    });
  }

  async create(data) {
    return prisma.user.create({
      data,
    });
  }
}

module.exports = new AuthRepository();
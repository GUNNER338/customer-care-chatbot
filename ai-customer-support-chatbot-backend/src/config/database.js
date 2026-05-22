const prisma = require("./prisma");

const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL Database Connected Successfully via Prisma");
  } catch (error) {
    console.error("Database Connection Error:", error);
    process.exit(1);
  }
};

module.exports = { connectDatabase };

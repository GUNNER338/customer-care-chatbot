import prisma from "./prisma";

/**
 * Connects to the PostgreSQL database using Prisma Client.
 * Validates the connection on application startup.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Attempt to connect to the database to ensure connection is valid
    await prisma.$connect();
    console.log("PostgreSQL Database Connected Successfully via Prisma");
  } catch (error) {
    console.error("Database Connection Error:", error);
    process.exit(1);
  }
};
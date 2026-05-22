"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const prisma_1 = __importDefault(require("./prisma"));
/**
 * Connects to the PostgreSQL database using Prisma Client.
 * Validates the connection on application startup.
 */
const connectDatabase = async () => {
    try {
        // Attempt to connect to the database to ensure connection is valid
        await prisma_1.default.$connect();
        console.log("PostgreSQL Database Connected Successfully via Prisma");
    }
    catch (error) {
        console.error("Database Connection Error:", error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;

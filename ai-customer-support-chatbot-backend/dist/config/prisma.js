"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const generated_1 = require("../generated");
// Initialize PostgreSQL connection pool
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
// Initialize Prisma PostgreSQL adapter
const adapter = new adapter_pg_1.PrismaPg(pool);
// Instantiate PrismaClient as a singleton with the driver adapter
const prisma = new generated_1.PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
exports.default = prisma;

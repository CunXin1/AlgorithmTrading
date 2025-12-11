import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 要求使用 adapter 或 accelerateUrl，这里用 pg adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

export default db;

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const db = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

export default db;

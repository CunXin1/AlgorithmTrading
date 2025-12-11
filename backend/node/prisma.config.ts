import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  // 告诉 Prisma schema 文件在哪
  schema: "src/db/prisma/schema.prisma",

  // 告诉它连接串从哪来（Prisma 7 要求放在 config 里）
  datasource: {
    url: env("DATABASE_URL"),
  },
});

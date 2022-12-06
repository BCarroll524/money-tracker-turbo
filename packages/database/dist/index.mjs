// src/client.ts
import { PrismaClient } from "@prisma/client";
var db = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production")
  global.prisma = db;
export {
  db
};
//# sourceMappingURL=index.mjs.map
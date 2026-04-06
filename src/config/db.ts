import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { logger } from "./logger";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

declare global {
  // Reuse the client during local hot reloads.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
  logger.info("Database connected successfully");
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info("Database disconnected");
};

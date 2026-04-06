import express from "express";
import dotenv from "dotenv";
import bookRoutes from "./routes/book-routes";
import { apiDocs } from "./config/api-docs";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { logger } from "./config/logger";
import { connectRedis, disconnectRedis } from "./config/redis";
import { requestLogger } from "./middleware/request-logger";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(requestLogger);
app.use("/books", bookRoutes);

app.get("/", (_req, res) => {
  res.send("BookShelf API running ... ");
});

const logApiRoutes = (): void => {
  logger.info("Registered API routes", { routeCount: apiDocs.length });

  apiDocs.forEach((route) => {
    logger.info(`${route.method} ${route.path}`, {
      method: route.method,
      path: route.path,
      params: route.params,
      bodyType: route.bodyType,
      responseType: route.responseType,
    });
  });
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await connectRedis();

    const server = app.listen(port, () => {
      logger.info("Server started", { port });
      logApiRoutes();
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info("Shutdown signal received", { signal });
      server.close(async () => {
        await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    logger.error("Failed to connect to database", { error });
    process.exit(1);
  }
};

void startServer();

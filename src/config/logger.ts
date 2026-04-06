import winston from "winston";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const baseMessage = `${ts} [${level}] ${message}`;
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";

  if (stack) {
    return `${baseMessage}${metaString}\n${stack}`;
  }

  return `${baseMessage}${metaString}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "bookshelf-api" },
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? combine(timestamp(), errors({ stack: true }), json())
          : combine(
              colorize(),
              timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              errors({ stack: true }),
              consoleFormat,
            ),
    }),
  ],
});

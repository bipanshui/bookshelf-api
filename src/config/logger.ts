import winston from "winston";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const developmentFormat = printf(({ timestamp: ts, level, message, stack, ...meta }) => {
  const metadata = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return stack
    ? `${ts} ${level}: ${message}${metadata}\n${stack}`
    : `${ts} ${level}: ${message}${metadata}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? combine(timestamp(), errors({ stack: true }), json())
          : combine(
              errors({ stack: true }),
              colorize(),
              timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              developmentFormat,
            ),
    }),
  ],
});

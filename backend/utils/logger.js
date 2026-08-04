import winston from 'winston';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json, splat } = format;

// Custom format for development logs
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  splat(),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// JSON format for production logs
const prodFormat = combine(timestamp(), splat(), json());

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    // You can add file transports here for production logging
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
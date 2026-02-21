import pino from "pino";

/**
 * Sanitizes strings for logging to prevent log injection.
 * Removes newlines and control characters.
 */
export function sanitizeLog(str: string): string {
  return str.replace(/[\n\r\t]/g, " ").replace(/[^\x20-\x7E]/g, "");
}

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

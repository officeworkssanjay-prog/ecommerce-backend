import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/** Per-IP request limiter. Disabled in the automated test environment so repeated runs don't trip it. */
export function createLimiter(windowMinutes: number, max: number, message: string) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    message: { success: false, message },
  });
}

import "dotenv/config";

/**
 * Central, validated environment config. The process refuses to start when a
 * security-critical variable is missing instead of silently using a default.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const JWT_SECRET = required("JWT_SECRET");
if (JWT_SECRET.length < 16) {
  throw new Error("JWT_SECRET must be at least 16 characters long");
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  PORT: Number(process.env.PORT) || 5000,
  JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  // Online payments are optional: without these keys only cash on delivery is offered.
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
} as const;

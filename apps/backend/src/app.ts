import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { createLimiter } from "./middlewares/rate-limit";
import authRoutes from "./routes/auth.routes";
import storefrontRoutes from "./routes/storefront.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import uploadRoutes from "./routes/upload.routes";

export const app = express();

app.disable("x-powered-by");
// The web app proxies API calls, so the real client IP arrives in X-Forwarded-For (needed for rate limits).
app.set("trust proxy", 1);

app.use(
  helmet({
    // Uploaded images are loaded by the frontend from a different origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Static file hosting for uploaded media
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), { index: false, dotfiles: "deny" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const limiter = createLimiter;

// Abuse-prone public endpoints
app.use("/api/auth/login", limiter(15, 20, "Too many login attempts. Please try again later."));
app.use("/api/auth/register", limiter(60, 20, "Too many sign-ups from this address. Please try again later."));
app.use("/api/storefront/contact", limiter(60, 10, "Too many messages sent. Please try again later."));
app.use("/api/storefront/newsletter-subscribe", limiter(60, 10, "Too many requests. Please try again later."));

// Mount modular routes
app.use("/api/auth", authRoutes);
app.use("/api/storefront", storefrontRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

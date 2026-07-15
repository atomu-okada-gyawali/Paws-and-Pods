import express from "express";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { authRouter } from "./src/routers/auth.router.js";
import { checkoutRouter } from "./src/routers/checkout.router.js";
import { productsRouter } from "./src/routers/products.router.js";
import { ordersRouter } from "./src/routers/orders.router.js";
import { usersRouter } from "./src/routers/users.router.js";
import { accountRouter } from "./src/routers/account.router.js";
import { uploadsRouter } from "./src/routers/upload.router.js";
import { UPLOADS_DIR } from "./src/services/upload.service.js";
import { globalLimiter, authLimiter } from "./src/middleware/rateLimit.middleware.js";
import { connectDB } from "./src/db.js";

async function startServer() {
  await connectDB();
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // trust first proxy so we get the real client ip
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());

  // serve images before the limiter so they don't eat the rate budget
  app.use(
    "/api/uploads",
    express.static(UPLOADS_DIR, {
      index: false,
      setHeaders: (res) => res.setHeader("Cache-Control", "public, max-age=86400"),
    })
  );

  app.use("/api", globalLimiter);

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/v1/checkout", checkoutRouter);
  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/orders", ordersRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/account", accountRouter);
  app.use("/api/v1/images", uploadsRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(import.meta.dirname, "..", "client", "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Paws & Pods Server] Listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical failure during server startup sequence:", error);
  process.exit(1);
});

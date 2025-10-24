import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { errorHandler, notFound } from "./middleware/errorHandler";
import corsOptions from "./middleware/cors";
import healthRoutes from "./routes/index";
import apiRoutes from "./routes/api.routes";

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Car Wrap Ads API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// Routes
app.use("/", healthRoutes);
app.use("/api", apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.PORT, () => {
      console.log("🚀 Server started successfully!");
      console.log(`📡 Port: ${config.PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await disconnectDatabase();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start the server
startServer();

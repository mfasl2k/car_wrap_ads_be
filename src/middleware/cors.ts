import cors from "cors";
import { config } from "../config/env";

// CORS Configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (config.NODE_ENV === "development") {
      return callback(null, true);
    }

    // In production, check against whitelist
    const whitelist = process.env.ALLOWED_ORIGINS?.split(",") || [];

    if (whitelist.indexOf(origin) !== -1 || whitelist.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["X-Total-Count", "X-Page", "X-Page-Size"],
  maxAge: 86400, // 24 hours
};

export default corsOptions;

import { Router } from "express";
import authRoutes from "./auth.routes";
import driverRoutes from "./driver.routes";
import vehicleRoutes from "./vehicle.routes";
import advertiserRoutes from "./advertiser.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/drivers", driverRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/advertisers", advertiserRoutes);

export default router;

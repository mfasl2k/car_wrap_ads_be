import { Router } from "express";
import authRoutes from "./auth.routes";
import driverRoutes from "./driver.routes";
import vehicleRoutes from "./vehicle.routes";
import advertiserRoutes from "./advertiser.routes";
import campaignRoutes from "./campaign.routes";
import targetAreaRoutes from "./targetArea.routes";
import districtRoutes from "./district.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/drivers", driverRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/advertisers", advertiserRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/districts", districtRoutes); // NEW: District management
router.use("/", targetAreaRoutes); // Includes both /campaigns/:id/target-areas and /target-areas/:id

export default router;

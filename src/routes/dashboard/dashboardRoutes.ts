import { Router } from "express";
import { dashboardController } from "../../controllers/dashboard/dashboard.controller";

const router = Router();

router.get("/data/:userId", dashboardController.getDashboardData);

export default router;

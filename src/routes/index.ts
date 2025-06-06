import { Router } from "express";
const router = Router();
import transactionRoutes from "./transaction/transactionRoutes";
import authRoutes from "./auth/authRoute";
import dashboardRoutes from "./dashboard/dashboardRoutes";

router.use("/transactions", transactionRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;

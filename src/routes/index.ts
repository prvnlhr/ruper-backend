import { Router } from "express";
const router = Router();
import transactionRoutes from "./transaction/transactionRoutes";
import authRoutes from "./auth/authRoute";

router.use("/transaction", transactionRoutes);
router.use("/auth", authRoutes);

export default router;

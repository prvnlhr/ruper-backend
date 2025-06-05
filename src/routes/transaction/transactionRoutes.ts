import { Router } from "express";
import { transactionController } from "../../controllers/transaction/transaction.controller";
const router = Router();

router.post("/add", transactionController.addTransaction);

export default router;

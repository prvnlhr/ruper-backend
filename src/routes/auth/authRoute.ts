import { Router } from "express";
import { authController } from "../../controllers/auth/auth.controller";
const router = Router();

router.post("/sign-up", authController.signUpUser);

export default router;

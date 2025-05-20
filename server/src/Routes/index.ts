import { Router } from "express";
import authRouter from "./auth.router";
import chatRouter from "./chat.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/chat", chatRouter);

export default router;
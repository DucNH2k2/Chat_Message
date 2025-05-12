import { Authenticate } from "../Middlewares/authenticate";
import { sendOTP, getAccountMe, login, register, verifyOTP, loginAccountGoogle, refreshToken } from "../Controllers/auth.controller";
import { Router } from "express";

const authRouter = Router();

authRouter.post('/send-otp', sendOTP);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/register', register);

authRouter.post('/login', login);
authRouter.post('/google', loginAccountGoogle);

authRouter.get('/refresh-token', refreshToken);
authRouter.get('/account', Authenticate, getAccountMe);

export default authRouter;
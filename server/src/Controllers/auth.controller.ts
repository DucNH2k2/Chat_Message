import { Request, Response } from 'express';
import authService from '../Services/auth.service';
import { setAuthCookies } from '../Utils/auth';

export const sendOTP = async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        res.status(400).json({ message: 'Phone number is required!' });
        return
    }

    try {
        await authService.sendOTP(phoneNumber);
        res.json({ isSentOTP: true });
    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err?.message || 'Failed to send OTP' });
    }
};

export const verifyOTP = async (req: Request, res: Response) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
        res.status(400).json({ message: 'Missing OTP or phone' });
        return;
    };

    try {
        await authService.verifyOTP(phoneNumber, otp);
        res.json({ isVerify: true });
    } catch (err: any) {
        console.error(err)
        res.status(400).json({ message: err?.message || 'OTP is incorrect' });
    }
};

export const register = async (req: Request, res: Response) => {
    const { phoneNumber, name, password, confirmPassword } = req.body;
    if (!phoneNumber || !name || !password || !confirmPassword) {
        res.status(400).json({ message: 'All fields required' })
        return;
    }

    if (password !== confirmPassword) {
        res.status(400).json({ message: 'Passwords must match' })
        return;
    }

    try {
        const { accessToken, refreshToken } = await authService.register({ phoneNumber, password, name });
        setAuthCookies(res, refreshToken);
        res.json({ isRegister: true, accessToken });
    } catch (err: any) {
        console.error(err)
        res.status(400).json({ message: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        res.status(400).json({ message: 'Missing credentials' });
        return;
    }

    try {
        const { accessToken, refreshToken } = await authService.login({ phoneNumber, password });
        setAuthCookies(res, refreshToken);
        res.json({ accessToken });
    } catch (err: any) {
        console.error(err)
        res.status(400).json({ message: err.message });
    }
};

export const loginAccountGoogle = async (req: Request, res: Response) => {
    const idToken = req.headers.authorization;
    if (!idToken) {
        res.sendStatus(401);
        return;
    };

    try {
        await authService.loginWithGoogle(idToken);

        res.json({ message: 'User authenticated successfully' });
    } catch (err) {
        console.error(err)
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

export const refreshToken = (req: Request, res: Response) => {
    const cookies = req.headers.cookie;
    const tokenCookie = cookies?.split(';').find(c => c.trim().startsWith('refreshToken='));
    const refreshToken = tokenCookie?.split('=')[1];

    if (!refreshToken) {
        res.sendStatus(400);
        return;
    }

    try {
        const newAccessToken = authService.refreshAccessToken(refreshToken);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err)
        res.clearCookie("refreshToken");
        res.sendStatus(400);
    }
};

export const getAccountMe = (req: Request, res: Response) => {
    const account = req.account;

    if (!account) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const sanitized = authService.getSanitizedAccount(account);
    res.json(sanitized);
};
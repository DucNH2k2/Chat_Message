import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import firebase from "firebase-admin";
import { PayLoadJWT } from '../types/auth';

export enum ProviderAccount {
    GOOGLE = "google",
    PHONE_NUMBER = "phone_number",
}

export const generateAccessToken = (_id: string, provider: ProviderAccount) => {
    const payload = { _id, provider, sessionId: uuidv4(), exp: Date.now() + 60 * 60 * 1000 };
    return jwt.sign(payload, process.env.JWT_SECRET!, { algorithm: 'HS256' });
};

export const generateRefreshToken = (_id: string, provider: ProviderAccount) => {
    const payload = { _id, provider, sessionId: uuidv4() };
    
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { algorithm: 'HS256' });
};

export const setAuthCookies = (res: Response, refreshToken: string) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    });
};

export function verifyAccessToken(refreshToken: string): PayLoadJWT {
    return jwt.verify(refreshToken, process.env.JWT_SECRET!) as PayLoadJWT;
}

export function verifyRefreshToken(refreshToken: string): PayLoadJWT {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as PayLoadJWT;
}

export function verifyFirebaseToken(token: string) {
    return firebase.auth().verifyIdToken(token);
}

export const generateOTP = (limit: number = 6): string => {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < limit; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
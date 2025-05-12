import bcrypt from 'bcryptjs';
import accountRepo from '../Repositories/account.repository';
import { generateAccessToken, generateOTP, generateRefreshToken, ProviderAccount, verifyFirebaseToken, verifyRefreshToken } from '../Utils/auth';
import { redisClient } from '../config/redis';
import { IAccount } from '../Models/account.model';
import { HydratedDocument } from 'mongoose';

const EXPIRE_TIME_OTP_REDIS = 180;
const register = async (newAccount: Required<Pick<IAccount, "phoneNumber" | "password" | "name">>) => {
    const { phoneNumber, password, name } = newAccount;

    const existing = await accountRepo.findByPhoneNumber(phoneNumber);
    if (existing) {
        throw new Error('Phone number already registered');
    }

    const verified = await redisClient.get(`OTP_REGISTER_VERIFIED:${phoneNumber}`);
    if (!verified) {
        throw new Error('OTP not verified');
    }

    const hashed = await bcrypt.hash(password, 12);
    const account = await accountRepo.saveAccount({
        phoneNumber,
        password: hashed,
        name,
        provider: ProviderAccount.PHONE_NUMBER
    });

    const accessToken = generateAccessToken(account._id as string, account.provider);
    const refreshToken = generateRefreshToken(account._id as string, account.provider);

    return { account, accessToken, refreshToken };
};

const login = async ({ phoneNumber, password }: { phoneNumber: string, password: string }) => {
    const account = await accountRepo.findByPhoneNumber(phoneNumber);
    const isValid = account?.password && await bcrypt.compare(password, account.password);

    if (!account || !isValid) {
        throw new Error('Invalid credentials');
    }

    const accessToken = generateAccessToken(account._id as string, account.provider);
    const refreshToken = generateRefreshToken(account._id as string, account.provider);

    return { account, accessToken, refreshToken };
};

const verifyOTP = async (phoneNumber: string, otp: string) => {
    const stored = await redisClient.get(`OTP_REGISTER:${phoneNumber}`);
    if (otp !== stored) {
        throw new Error('OTP is incorrect');
    }

    await redisClient.setEx(`OTP_REGISTER_VERIFIED:${phoneNumber}`, EXPIRE_TIME_OTP_REDIS, 'true');
};

const sendOTP = async (phoneNumber: string) => {
    const existing = await accountRepo.findByPhoneNumber(phoneNumber);
    if (existing) {
        throw new Error('Phone number already registered');
    }

    const otp = generateOTP();

    await redisClient.setEx(`OTP_REGISTER:${phoneNumber}`, EXPIRE_TIME_OTP_REDIS, otp);
    await redisClient.del(`OTP_REGISTER_VERIFIED:${phoneNumber}`);

    return otp;
};

const loginWithGoogle = async (idToken: string) => {
    const { uid, email, name } = await verifyFirebaseToken(idToken);
    let account = await accountRepo.findByAuthId(uid);

    if (!account) {
        account = await accountRepo.saveAccount({
            authId: uid,
            email,
            name,
            provider: ProviderAccount.GOOGLE
        });
    }

    return { account };
}

const refreshAccessToken = (refreshToken: string): string => {
    const decoded = verifyRefreshToken(refreshToken);
    return generateAccessToken(decoded._id, decoded.provider);
}

const getSanitizedAccount = (account: HydratedDocument<IAccount>) => {
    const plain = account.toObject();

    delete plain.password;
    delete plain.authId;
    return plain;
}

export default {
    register,
    login,
    verifyOTP,
    sendOTP,
    loginWithGoogle,
    refreshAccessToken,
    getSanitizedAccount
}
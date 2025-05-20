import { HydratedDocument } from "mongoose";
import { Socket } from "socket.io";
import { IAccount } from "../Models/account.model";
import { ProviderAccount, verifyAccessToken, verifyFirebaseToken } from "../Utils/auth";
import accountRepo from "../Repositories/account.repository";

export const authenticateSocket = async (socket: Socket, next: any) => {
    const { token, authProvider } = socket.handshake.auth;  // Lấy token từ client

    if (!token || !authProvider) {
        return next(new Error('Missing token or provider'));
    }

    try {
        let account: HydratedDocument<IAccount> | null = null;

        if (authProvider === ProviderAccount.GOOGLE) {
            const { uid } = await verifyFirebaseToken(token);
            account = await accountRepo.findByAuthId(uid);
        }

        if (authProvider === ProviderAccount.PHONE_NUMBER) {
            const { _id } = verifyAccessToken(token);
            account = await accountRepo.findById(_id);
        }

        if (!account) {
            return next(new Error('Invalid token'));
        }

        socket.data.account = account;

        next();
    } catch (err) {
        console.error('Auth error:', err);
        return next(new Error('Authentication failed'));
    }
};

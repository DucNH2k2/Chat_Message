import { NextFunction, Request, Response } from "express";
import { IAccount } from "../Models/account.model";
import { HydratedDocument } from "mongoose";
import { ProviderAccount, verifyAccessToken, verifyFirebaseToken } from "../Utils/auth";
import accountRepo from '../Repositories/account.repository';

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const provider = req.headers['x-auth-provider'] as ProviderAccount;

    if (!authHeader || !authHeader.startsWith('Bearer ') || !provider) {
        res.sendStatus(401);
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        let account: HydratedDocument<IAccount> | null = null;

        if (provider === ProviderAccount.GOOGLE) {
            const { uid } = await verifyFirebaseToken(token);
            account = await accountRepo.findByAuthId(uid);
        }

        if (provider === ProviderAccount.PHONE_NUMBER) {
            const { _id } = verifyAccessToken(token);
            account = await accountRepo.findById(_id);
        }

        if (!account) {
            res.sendStatus(401);
            return;
        }

        req.account = account;
        next();
    } catch (err) {
        console.error(err)
        res.sendStatus(401);
    }
}
import { Document, model, Schema } from "mongoose";
import { ProviderAccount } from "../Utils/auth";

export interface IAccount extends Document {
    name: String;
    phoneNumber?: string;
    password?: string;
    authId?: string;
    email?: string;
    provider: ProviderAccount;
    createAt: Date;
}

const accountSchema = new Schema<IAccount>({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    authId: {
        type: String,
        unique: true,
        sparse: true
    },
    provider: {
        type: String,
        enum: ProviderAccount,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

export const AccountModel = model<IAccount>("Account", accountSchema)
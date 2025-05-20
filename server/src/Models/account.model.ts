import { Document, model, Schema } from "mongoose";
import { ProviderAccount } from "../Utils/auth";

export interface IAccount extends Document {
    avatarUrl?: string;
    name: string;
    phoneNumber?: string;
    password?: string;
    authId?: string;
    email?: string;
    provider: ProviderAccount;
    createAt: Date;
}

const accountSchema = new Schema<IAccount>({
    avatarUrl: {
        type: String,
    },
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
        enum: Object.values(ProviderAccount),
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
});

export const AccountModel = model<IAccount>("Account", accountSchema)
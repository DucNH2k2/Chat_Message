import { Document, model, Schema, Types } from "mongoose";
import { AccountModel } from "./account.model";

export interface IContact extends Document {
    userId: Types.ObjectId;
    contactUserId: Types.ObjectId;
    name: string;
    createdAt: Date
}

const ContactSchema = new Schema<IContact>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: AccountModel.modelName,
        required: true,
    },
    contactUserId: {
        type: Schema.Types.ObjectId,
        ref: AccountModel.modelName,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

export const ContactModel = model<IContact>("Contact", ContactSchema);
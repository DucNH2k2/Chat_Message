import { model, Schema, Types } from "mongoose";
import { AccountModel } from "./account.model";

export interface IContact {
    userId: Types.ObjectId;
    userContactId: Types.ObjectId;
    name: String;
    createdAt: Date
}

const ContactSchema = new Schema<IContact>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: AccountModel.modelName,
        required: true,
    },
    userContactId: {
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
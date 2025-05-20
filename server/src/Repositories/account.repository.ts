import { FilterQuery } from "mongoose";
import { AccountModel, IAccount } from "../Models/account.model"

const findById = (id: string) => {
    const account = AccountModel.findById(id);
    return account;
}

const findByPhoneNumber = (phoneNumber: string) => {
    const account = AccountModel.findOne({ phoneNumber });
    return account;
}

const findByAuthId = (authId: string) => {
    const account = AccountModel.findOne({ authId });
    return account;
}

const saveAccount = (newAccount: Partial<IAccount>) => {
    const account = AccountModel.insertOne(newAccount);
    return account;
}

const findMany = (condition: FilterQuery<IAccount>) => {
  return AccountModel.find(condition);
};

export default { findByAuthId, findByPhoneNumber, saveAccount, findById, findMany }
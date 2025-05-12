import { call, put, takeLatest } from "redux-saga/effects";
import { setCurrentAccount } from "./chatSlice";
import { AxiosResponse } from "axios";
import { fetchCurrentAccount } from "~/services/auth.service";
import Account from "~/models/auth/account.model";
import { createAction } from "@reduxjs/toolkit";

export const getCurrentAccountAction = createAction("getCurrentAccount");
function* getCurrentAccount() {
    try {
        const response: AxiosResponse<Account> = yield call(() => fetchCurrentAccount());

        yield put(setCurrentAccount(response.data));
    } catch (error) {
        console.error(error);
    }
}


export function* getCurrentAccountSaga() {
    yield takeLatest(getCurrentAccountAction.type, getCurrentAccount)
}
import Account, { RegisterAccount } from "~/models/auth/account.model";
import axiosInstance from "./axiosInstance";
import { AxiosRequestConfig } from "axios";

export const fetchSendOTP = (phoneNumber: string) => {
    return axiosInstance.post<{ isSentOTP: boolean, message: string }>("/auth/send-otp", { phoneNumber });
}

export const fetchVerifyOTP = (phoneNumber: string, otp: string) => {
    return axiosInstance.post<{ isVerify: boolean, message: string }>("/auth/verify-otp", { phoneNumber, otp });
}

export const fetchRegisterAccount = (account: RegisterAccount) => {
    return axiosInstance.post<{ isRegister: boolean, accessToken: string, message: string }>("/auth/register", account);
}

export const loginJWT = (account: Account) => {
    return axiosInstance.post<{ accessToken: string }>('/auth/login', account, {
        withCredentials: true
    })
}

export const loginWithGoogle = (options: AxiosRequestConfig) => {
    return axiosInstance.post('/auth/google', {}, options)
}

export const refreshToken = () => {
    return axiosInstance.get<{ accessToken: string }>("/auth/refresh-token", {
        withCredentials: true
    });
}

export const fetchCurrentAccount = () => {
    return axiosInstance.get<Account>('/auth/account');
}
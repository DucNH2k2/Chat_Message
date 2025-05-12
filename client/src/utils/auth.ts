import { onAuthStateChanged } from "firebase/auth";
import { refreshToken } from "~/services/auth.service";
import { authFirebase } from "~/services/firebase";

/** enum */
export enum StepRegister {
    ENTER_PHONE_NUMBER = 1,
    ENTER_OTP = 2,
    ENTER_ACCOUNT = 3
}

export enum ProviderAccount {
    GOOGLE = "google",
    PHONE_NUMBER = "phone_number",
}

/** constant */
export const ACCESS_TOKEN = "access_token";
export const AUTH_PROVIDER = "auth_provider";

export const ACCOUNT_REGISTER_KEY = "account_register";
export const EXPIRE_TIME_STEP_REGISTER = 180;
export const MINIMUM_REMAINING_TIME_REGISTER = 10;

export const LABEL_SUBMIT_REGISTER = {
    [StepRegister.ENTER_PHONE_NUMBER]: "Send OTP",
    [StepRegister.ENTER_OTP]: "Verify OTP",
    [StepRegister.ENTER_ACCOUNT]: "Register",

};

/** function */
export const handleRefreshToken = async (authProvider: ProviderAccount) => {
    let token: string = "";

    try {
        if (authProvider === ProviderAccount.GOOGLE) {
            token = await new Promise((resolve) => {
                const unsubscribe = onAuthStateChanged(authFirebase, async (user) => {
                    if (user) {
                        const token = user.getIdToken();
                        resolve(token);
                    }

                    unsubscribe();
                });
            });
        } else if (authProvider === ProviderAccount.PHONE_NUMBER) {
            const res = await refreshToken();
            token = res.data.accessToken;
        }
    } catch (err) {
        console.log(err);
    }

    return token;
}
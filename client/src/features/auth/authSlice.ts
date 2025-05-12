import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StepRegister } from "~/utils/auth";

export interface AuthState {
    loading: boolean;
    stepRegister: StepRegister;
    errorMessage: string;
}

const initialState: AuthState = {
    loading: false,
    stepRegister: StepRegister.ENTER_PHONE_NUMBER,
    errorMessage: "",
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setStepRegister: (state: AuthState, action: PayloadAction<StepRegister>) => {
            state.stepRegister = action.payload
        },
        setErrorMessage: (state: AuthState, action: PayloadAction<string>) => {
            state.errorMessage = action.payload
        },
        clearAuthSlice: () => {
            return initialState;
        }
    },
});

export const { setLoading, setStepRegister, setErrorMessage, clearAuthSlice } = authSlice.actions;

export default authSlice.reducer;
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Account from "~/models/auth/account.model";

export interface ChatState {
    currentAccount: Account | null;
}

const initialState: ChatState = {
    currentAccount: null,
}

export const chatSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCurrentAccount: (state: ChatState, action: PayloadAction<Account>) => {
            state.currentAccount = action.payload;
        }
    },
});

export const { setCurrentAccount } = chatSlice.actions;

export default chatSlice.reducer;
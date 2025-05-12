import { configureStore } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"
import RootSaga from "./rootSaga";
import authReducer from "~/features/auth/authSlice";
import chatReducer from "~/features/chat/chatSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer
    },
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware);
    },
})

sagaMiddleware.run(RootSaga);

// Infer the type of `store`
export type AppStore = typeof store

export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = typeof store.dispatch;

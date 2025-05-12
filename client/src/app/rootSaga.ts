import { all } from "redux-saga/effects";
import { getCurrentAccountSaga } from "~/features/chat/chatSaga";

export default function* RootSaga() {
    yield all([
        getCurrentAccountSaga()
    ]);
}
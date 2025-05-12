import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { ProviderAccount } from "../../Utils/auth";

interface PayLoadJWT {
    _id: string;
    sessionId: string;
    provider: ProviderAccount;
    exp?: number
};

type DecodeToken = PayLoadJWT | DecodedIdToken;
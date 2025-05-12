import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { loginWithGoogle } from '~/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { HttpStatusCode } from 'axios';
import { ACCESS_TOKEN, AUTH_PROVIDER, ProviderAccount } from '~/utils/auth';
import { authFirebase } from '~/services/firebase';
import { AppDispatch } from '~/app/store';
import { useDispatch } from 'react-redux';
import { setLoading } from '../authSlice';

const LoginWithGoogle: React.FC = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    const handleLogin = async () => {
        dispatch(setLoading(true))

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account',
        });

        try {
            const result = await signInWithPopup(authFirebase, provider);
            const token = await result.user.getIdToken();

            const res = await loginWithGoogle({
                headers: {
                    'Authorization': token,
                }
            });

            if (res.status === HttpStatusCode.Ok) {
                localStorage.setItem(ACCESS_TOKEN, token);
                localStorage.setItem(AUTH_PROVIDER, ProviderAccount.GOOGLE);
                navigate("/chat")
            }
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false))
        }
    };

    return (
        <button
            onClick={handleLogin}
            type="button"
            className="cursor-pointer bg-red-500 text-white w-full p-2 flex flex-row justify-center gap-2 items-center hover:bg-red-600 duration-100 ease-in-out"
        >
            <svg aria-hidden="true" role="img" className="w-5" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                <g fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018c0-3.878 3.132-7.018 7-7.018c1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062c-2.31 0-4.187 1.956-4.187 4.273c0 2.315 1.877 4.277 4.187 4.277c2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474c0 4.01-2.677 6.86-6.72 6.86z" fill="currentColor" />
                </g>
            </svg>
            Sign-in with Google
        </button>
    );
};

export default LoginWithGoogle;

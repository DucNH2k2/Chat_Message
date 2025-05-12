import { Form, Formik } from "formik";
import { object, string } from "yup";
import Account from "~/models/auth/account.model";
import { loginJWT } from "~/services/auth.service";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, AUTH_PROVIDER, ProviderAccount } from "~/utils/auth";
import PhoneNumberInput from "~/components/inputs/PhoneNumberInput";
import PasswordInput from "~/components/inputs/PasswordInput";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/app/store";
import { clearAuthSlice, setErrorMessage, setLoading } from "../authSlice";
import { useEffect } from "react";

const LoginWithPhoneNumber = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    const { errorMessage } = useSelector((state: RootState) => state.auth)

    const validationSchema = object<Account>({
        phoneNumber: string().required("Phone number is required!"),
        password: string().required("Password is required!"),
    });

    const onLogin = async (values: Account) => {
        dispatch(setLoading(true))

        try {
            const res = await loginJWT(values);

            localStorage.setItem(ACCESS_TOKEN, res.data.accessToken);
            localStorage.setItem(AUTH_PROVIDER, ProviderAccount.PHONE_NUMBER);

            navigate("/chat");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                dispatch(setErrorMessage(err.response?.data?.message));
            }
            console.error(err);
        } finally {
            dispatch(setLoading(false))
        }
    }

    useEffect(() => {
        return () => {
            clearAuthSlice()
        }
    }, []);

    return (
        <Formik
            initialValues={new Account()}
            validationSchema={validationSchema}
            onSubmit={onLogin}
        >
            <Form className="flex flex-col gap-4 px-0 py-4">
                <PhoneNumberInput
                    label="Phone number"
                    name="phoneNumber"
                    placeholder="Enter phone number"
                    type="tel"
                />

                <PasswordInput
                    label="Password"
                    name="password"
                    placeholder="Enter password"
                    type="password"
                />

                {errorMessage && <p className="text-red-800">{errorMessage}</p>}

                <div className="w-full flex flex-row gap-2">
                    <button className="cursor-pointer border border-indigo-500 hover:bg-indigo-500 hover:text-white duration-100 ease-in-out w-6/12 text-indigo-500 p-0 flex flex-row justify-center items-center gap-1" type="submit">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg> Login
                    </button>

                    <NavLink to="/auth/register" className="border border-indigo-500 hover:bg-indigo-500 hover:text-white duration-100 ease-in-out w-6/12 text-indigo-500 p-2 flex flex-row justify-center items-center gap-1">
                        <svg className="w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg> Sign-up
                    </NavLink>
                </div>

                {/* <div className="w-full flex flex-row justify-end">
                <a href="#">Forgot password</a>
            </div> */}
            </Form>
        </Formik>
    );
}


export default LoginWithPhoneNumber;
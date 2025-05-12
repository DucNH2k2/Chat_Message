/* eslint-disable react-hooks/exhaustive-deps */
import { Form, useFormik, FormikProvider } from "formik";
import { useLayoutEffect } from "react";
import Account, { RegisterAccount } from "~/models/auth/account.model";
import { fetchVerifyOTP, fetchRegisterAccount, fetchSendOTP } from "~/services/auth.service";
import { useCountdown } from "~/hooks/countdown";
import * as Yup from "yup";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, ACCOUNT_REGISTER_KEY, AUTH_PROVIDER, EXPIRE_TIME_STEP_REGISTER, LABEL_SUBMIT_REGISTER, MINIMUM_REMAINING_TIME_REGISTER, ProviderAccount, StepRegister } from "~/utils/auth";
import { formatSecondsToMinutes } from "~/utils/date-time";
import PhoneNumberInput from "~/components/inputs/PhoneNumberInput";
import FieldInput from "~/components/inputs/FieldInput";
import PasswordInput from "~/components/inputs/PasswordInput";
import { AppDispatch, RootState } from "~/app/store";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthSlice, setErrorMessage, setLoading, setStepRegister } from "../authSlice";

const Register = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    const { stepRegister, errorMessage } = useSelector((state: RootState) => state.auth)

    const [countdown, startCountdown] = useCountdown(0);

    const validateSchema = Yup.object<Account>({
        phoneNumber: Yup.string()
            .nullable()
            .required("Phone number is required!")
            .matches(/^(0|\+84)[3|5|7|8|9]\d{8}$/, "Invalid phone number"),
        otp: stepRegister !== StepRegister.ENTER_OTP ? null : Yup.string()
            .nullable()
            .required("OTP is required!"),
        name: stepRegister !== StepRegister.ENTER_ACCOUNT ? null : Yup.string()
            .required("Name is required!")
            .min(2, "Name must be least 8 characters!"),
        password: stepRegister !== StepRegister.ENTER_ACCOUNT ? null : Yup.string()
            .required("Password is required!")
            .min(8, "Password must be least 8 characters!")
            .matches(/\d/, "Password must contain at least one number"),
        confirmPassword: stepRegister !== StepRegister.ENTER_ACCOUNT ? null : Yup.string()
            .nullable()
            .required("Confirm password is required!")
            .oneOf([Yup.ref("password")], "Passwords must match!"),
    });

    const formik = useFormik<RegisterAccount>({
        initialValues: new RegisterAccount(),
        validationSchema: validateSchema,
        onSubmit: async (values) => {
            dispatch(setLoading(true))

            dispatch(setErrorMessage(""));
            try {
                switch (stepRegister) {
                    case StepRegister.ENTER_PHONE_NUMBER:
                        await sendOTP(values.phoneNumber);
                        break;
                    case StepRegister.ENTER_OTP:
                        await verifyOTP(values.phoneNumber, values.otp);
                        break;
                    case StepRegister.ENTER_ACCOUNT:
                        await submitRegisterAccount(values);
                        break;
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    dispatch(setErrorMessage(err.response?.data?.message));
                }
                console.error(err);
            } finally {
                dispatch(setLoading(false))
            }
        },
    });

    useLayoutEffect(() => {
        const stored = localStorage.getItem(ACCOUNT_REGISTER_KEY);

        if (!stored) {
            return;
        };

        const { step: savedStep, phoneNumber, expirationTime } = JSON.parse(stored);
        const account = new RegisterAccount();
        let newStep = StepRegister.ENTER_PHONE_NUMBER;

        const timeLeft = Math.floor((expirationTime - Date.now()) / 1000);

        if (timeLeft > MINIMUM_REMAINING_TIME_REGISTER) {
            newStep = savedStep;

            if (newStep === StepRegister.ENTER_OTP) {
                startCountdown(timeLeft);
            }
        }

        if (newStep !== StepRegister.ENTER_PHONE_NUMBER) {
            account.phoneNumber = phoneNumber;
        }

        formik.setValues(account);
        dispatch(setStepRegister(newStep));

        return () => {
            clearAuthSlice()
        }
    }, []);

    // Save state to localStorage
    const persistStepToLocalStorage = (step: StepRegister, phoneNumber: string) => {
        const expirationTime = Date.now() + EXPIRE_TIME_STEP_REGISTER * 1000;
        const data = { step, phoneNumber, expirationTime };
        localStorage.setItem(ACCOUNT_REGISTER_KEY, JSON.stringify(data));
    };

    const sendOTP = async (phoneNumber: string) => {
        const res = await fetchSendOTP(phoneNumber);
        if (!res.data.isSentOTP) {
            dispatch(setErrorMessage(res.data.message));
            return;
        }

        dispatch(setStepRegister(StepRegister.ENTER_OTP));
        startCountdown(EXPIRE_TIME_STEP_REGISTER);

        persistStepToLocalStorage(StepRegister.ENTER_OTP, phoneNumber);
    };

    const verifyOTP = async (phoneNumber: string, otp: string) => {
        const res = await fetchVerifyOTP(phoneNumber, otp);
        if (!res.data.isVerify) {
            dispatch(setErrorMessage(res.data.message));
            return;
        }

        formik.setFieldValue("otp", "");
        dispatch(setStepRegister(StepRegister.ENTER_ACCOUNT));
        persistStepToLocalStorage(StepRegister.ENTER_ACCOUNT, phoneNumber);
    };

    const submitRegisterAccount = async (values: RegisterAccount) => {
        const res = await fetchRegisterAccount(values);
        if (!res.data.isRegister) {
            dispatch(setErrorMessage(res.data.message));
            return;
        }

        localStorage.removeItem(ACCOUNT_REGISTER_KEY);
        localStorage.setItem(ACCESS_TOKEN, res.data.accessToken);
        localStorage.setItem(AUTH_PROVIDER, ProviderAccount.PHONE_NUMBER);

        navigate("/chat");
    };

    const handleReEnterPhoneNumber = () => {
        dispatch(setStepRegister(StepRegister.ENTER_PHONE_NUMBER));
        formik.setValues(new RegisterAccount());
        localStorage.removeItem(ACCOUNT_REGISTER_KEY);
    };

    const secondsUntilResend = EXPIRE_TIME_STEP_REGISTER - countdown;

    return (
        <FormikProvider value={formik}>
            <Form className="bg-white sm:bg-gray-200 min-h-screen w-screen flex flex-col justify-center items-center">
                <div className="bg-white shadow-none sm:shadow-lg px-8 sm:px-12 w-full xs:w-full sm:w-8/12 md:w-7/12 lg:w-7/12 xl:w-2/6 h-screen sm:h-auto py-8">
                    <div className="text-center w-full font-bold text-3xl text-gray-600 p-4">Register</div>
                    <div className="w-full bg-gray-200 my-3" style={{ height: '1px' }}></div>

                    <div className="flex flex-col gap-4 px-0 py-4">
                        <PhoneNumberInput
                            label="Phone number"
                            name="phoneNumber"
                            placeholder="Enter phone number"
                            type="tel"
                            disabled={stepRegister !== StepRegister.ENTER_PHONE_NUMBER}
                        />

                        {stepRegister === StepRegister.ENTER_OTP && (
                            <>
                                <PhoneNumberInput label="OTP" name="otp" placeholder="Enter OTP" />
                                <p className="text-sm text-gray-400">OTP expires after: {formatSecondsToMinutes(countdown)}</p>
                            </>
                        )}

                        {stepRegister === StepRegister.ENTER_ACCOUNT && (
                            <>
                                <FieldInput name="name" placeholder="Enter name" label="Name" />
                                <PasswordInput name="password" placeholder="Enter password" label="Password" />
                                <PasswordInput name="confirmPassword" placeholder="Enter confirm password" label="Confirm password" />
                            </>
                        )}

                        <div className="flex justify-between text-sm">
                            {stepRegister !== StepRegister.ENTER_PHONE_NUMBER && (
                                <button type="button" className="cursor-pointer text-gray-500 hover:underline" onClick={handleReEnterPhoneNumber}>
                                    ← Re-enter phone number
                                </button>
                            )}

                            {stepRegister === StepRegister.ENTER_OTP && (
                                <button
                                    type="button"
                                    className="cursor-pointer text-blue-600 hover:underline disabled:no-underline disabled:cursor-not-allowed"
                                    onClick={() => sendOTP(formik.values.phoneNumber)}
                                    disabled={secondsUntilResend < 60}
                                >
                                    Re-send OTP {secondsUntilResend < 60 ? `(${60 - secondsUntilResend}s)` : ''}
                                </button>
                            )}
                        </div>

                        {errorMessage && (
                            <p className="text-red-800 text-center">{errorMessage}</p>
                        )}

                        <div className="w-full">
                            <button
                                type="submit"
                                className="cursor-pointer py-2 border border-indigo-500 hover:bg-indigo-500 hover:text-white text-indigo-500 w-full flex justify-center items-center gap-1"
                            >
                                <svg className="w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>

                                {LABEL_SUBMIT_REGISTER[stepRegister]}
                            </button>
                        </div>

                        <div className="my-2 flex flex-row justify-center">
                            <span className="absolute bg-white px-4">or</span>
                            <div className="w-full bg-gray-200 mt-3" style={{ height: '1px' }}></div>
                        </div>

                        <div className="w-full flex flex-col gap-2">
                            <NavLink to="/auth/login" className="bg-red-500 text-white w-full p-2 flex flex-row justify-center gap-2 items-center hover:bg-red-600 duration-100 ease-in-out">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Sign-in
                            </NavLink>
                        </div>
                    </div>
                </div>
            </Form>
        </FormikProvider>
    )
}

export default Register;
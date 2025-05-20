/* eslint-disable react-hooks/exhaustive-deps */
import { AxiosError, AxiosRequestConfig, HttpStatusCode } from "axios";
import { useLayoutEffect } from "react";
import {  useNavigate } from "react-router-dom"
import axiosInstance from "~/services/axiosInstance";
import { ACCESS_TOKEN, AUTH_PROVIDER, handleRefreshToken, ProviderAccount } from "~/utils/auth";
import { getCurrentAccountAction } from "./chatSaga";
import { useDispatch } from "react-redux";
import Chat from "./Chat";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const authProvider = localStorage.getItem(AUTH_PROVIDER) as ProviderAccount;

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axiosInstance.defaults.headers.common["x-auth-provider"] = authProvider;

        type RequestConfigRetry = AxiosRequestConfig & { isRetry: boolean };

        axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error?.response?.status === HttpStatusCode.Unauthorized && !(error.config as RequestConfigRetry).isRetry) {
                    const token = await handleRefreshToken(authProvider);

                    if (token) {
                        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                        localStorage.setItem(ACCESS_TOKEN, token);

                        const originalRequest = error.config as RequestConfigRetry;
                        originalRequest.headers = axiosInstance.defaults.headers.common;
                        originalRequest.isRetry = true;

                        return axiosInstance(originalRequest);
                    }
                }

                if (error?.response?.status === HttpStatusCode.Unauthorized && (error.config as RequestConfigRetry).isRetry) {
                    localStorage.clear()
                    navigate("/auth/login");
                }

                return Promise.reject(error);
            }
        );

        dispatch(getCurrentAccountAction());
    }, []);

    return <Chat />;
}

export default Index;
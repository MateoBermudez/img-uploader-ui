import axios, {AxiosHeaders, AxiosRequestConfig, AxiosRequestHeaders} from 'axios';
import {backendUrls} from "@/types/constants";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 120000,
})

let accessToken: string | null = null;
let csrfToken: string | null = null;
let csrfInitPromise: Promise<void> | null = null;
const CSRF_ENDPOINT = process.env.NEXT_PUBLIC_BASE_CSRF_URL;
const CSRF_HEADER_NAME = 'X-CSRF-Token';

function withHeader(headers: AxiosRequestHeaders | undefined, key: string, value: string): AxiosRequestHeaders {
    const h = AxiosHeaders.from(headers || {});
    h.set(key, value);
    return h;
}

export function setCsrfToken(token: string) {
    csrfToken = token || null;
}

export function setAccessToken(token: string) {
    accessToken = token || null;
    if (accessToken) {
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
        delete apiClient.defaults.headers.common.Authorization;
    }
}

export async function initCsrf(): Promise<void> {
    if (!CSRF_ENDPOINT) return;
    if (csrfInitPromise) return csrfInitPromise;
    csrfInitPromise = apiClient
        .get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}${CSRF_ENDPOINT}`,
            { withCredentials: true })
        .then(({ data }) => {
            setCsrfToken(data.csrfToken);
        })
        .catch((error) => {
            csrfInitPromise = null;
            throw error;
        })
    return csrfInitPromise;
}

apiClient.interceptors.request.use(async (config) => {
    if (accessToken && !config.headers?.Authorization) {
        config.headers = withHeader(config.headers as AxiosRequestHeaders | undefined, 'Authorization', `Bearer ${accessToken}`);
    }
    const method = (config.method || 'get').toUpperCase();
    const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (unsafe.includes(method)) {
        if (!csrfToken) await initCsrf();
        if (csrfToken) {
            config.headers = withHeader(config.headers as AxiosRequestHeaders | undefined, CSRF_HEADER_NAME, csrfToken);
        }
    }
    return config;
});

type RetryConfig = AxiosRequestConfig & {
    _retryAuth?: boolean;
    _retryCsrf?: boolean;
};

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error.response?.status;
        const cfg = (error.config || {}) as RetryConfig || {};
        const url: string = cfg?.url || '';

        if (
            status === 401 &&
            !cfg._retryAuth &&
            !url.includes(backendUrls.login) &&
            !url.includes(backendUrls.refresh) &&
            !url.includes(backendUrls.signup)
        ) {
            try {
                cfg._retryAuth = true;
                const { data } = await apiClient.post(
                    `${process.env.NEXT_PUBLIC_BASE_API_URL}${backendUrls.refresh}`,
                    {},
                    { withCredentials: true }
                );
                if (data?.token) {
                    setAccessToken(data.token);
                    cfg.headers = withHeader(cfg.headers as AxiosRequestHeaders | undefined, 'Authorization', `Bearer ${data.token}`);
                }
                return apiClient.request(cfg)
            } catch {
                return Promise.reject(error);
            }
        }

        if (status === 403 && !cfg._retryCsrf) {
            try {
                cfg._retryCsrf = true;
                await initCsrf();
                const method = (cfg.method || 'get').toUpperCase();
                const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'];
                if (unsafe.includes(method) && csrfToken) {
                    cfg.headers = withHeader(cfg.headers as AxiosRequestHeaders | undefined, CSRF_HEADER_NAME, csrfToken);
                }
                return apiClient.request(cfg);
            } catch {
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);
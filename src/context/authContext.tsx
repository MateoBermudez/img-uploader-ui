'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {apiClient, setAccessToken} from '@/services/apliClient';
import {User} from "@/types/user";
import {RegisterPayload} from "@/types/registerPayload";

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    signup: (payload: RegisterPayload) => Promise<void>;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    me: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    signup: async () => {},
    login: async () => {},
    logout: async () => {},
    me: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hasToken, setHasToken] = useState<boolean>(false);

    const applyAccessToken = (token: string) => {
        setAccessToken(token);
        setHasToken(!!token);
    }

    const signup = async (payload: RegisterPayload) => {
        const newUser: User = {
            firstName: payload.firstName,
            lastName: payload.lastName,
            dateOfBirth: payload.dateOfBirth,
            email: payload.email,
            username: payload.username,
            passwordHash: payload.password,
        };
        const { data } = await apiClient.post('/auth/signup', { user: newUser }, { withCredentials: true });
        if (data?.token) applyAccessToken(data.token);
        try {
            await me();
        } catch {}
    };


    const login = async (identifier: string, password: string) => {
        const { data } = await apiClient.post("/auth/login", { identifier, password }, { withCredentials: true });
        if (data?.token) applyAccessToken(data.token);
        try {
            await me();
        } catch {}
    };

    const logout = async () => {
        try {
            await apiClient.post("/auth/logout", {}, {withCredentials: true});
            await apiClient.get('/auth/oauth/logout', {withCredentials: true});
        } catch {
        } finally {
            applyAccessToken("");
            setUser(null);
        }
    };

    const me = async () => {
        const { data } = await apiClient.get("/auth/me", { withCredentials: true });
        setUser(data.user ?? null);
    }

    useEffect(() => {
        me().catch(() => {});
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: hasToken || !!user, login, signup, logout, me }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
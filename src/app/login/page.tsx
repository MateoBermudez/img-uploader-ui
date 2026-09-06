"use client";

import styles from "./page.module.scss";
import React, { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { RegisterPayload } from "@/types/registerPayload";
import RequireGuest from "@/components/auth/RequireGuest";
import {ApiError} from "@/types/apiError";

export default function LoginPage() {
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(true);
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [form, setForm] = useState<RegisterPayload>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    const { login, signup } = useAuth();

    const handleOAuthLogin = (provider: "google" | "github") => {
        const base = process.env.NEXT_PUBLIC_BASE_API_URL;
        if (!base) {
            console.error("Missing NEXT_PUBLIC_BASE_API_URL environment variable");
            return;
        }
        window.location.href = `${base}/auth/oauth/${provider}`;
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            if (isSigningIn) {
                const identifier = form.username;
                if (!identifier || !form.password) {
                    setError("Please fill in all login fields.");
                    return;
                }
                await login(identifier, form.password);
                setMessage("Logged in successfully");
                router.push("/");
            } else {
                if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.email) {
                    setError("Please fill in all signup fields.");
                    return;
                }
                if (form.password.length < 6) {
                    setError("Password must be at least 6 characters long.");
                    return;
                }
                if (form.password !== form.confirmPassword) {
                    setError("Passwords do not match.");
                    return;
                }

                await signup(form);
                setMessage("Account created successfully");
                router.push("/");
            }
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            const apiMsg =
                apiErr?.response?.data?.message ||
                apiErr?.message ||
                "An error occurred. Please try again.";
            setError(apiMsg);
        }
    }

    return (
        <RequireGuest>
            <section id="login-page" className={styles.page}>
                <div className={styles.content}>
                    <div className={`${styles.loginBox} ${!isSigningIn ? styles.signupMode : ""}`}>
                        <h2>{isSigningIn ? "Welcome Back" : "Create your account"}</h2>

                        <form className={styles.loginForm} onSubmit={handleSubmit}>
                            <div className={`${styles.signupExtra} ${isSigningIn ? styles.hidden : styles.visible}`}>
                                <div className={styles.gridRow}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="firstName">First name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            required={!isSigningIn}
                                            value={form.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label htmlFor="lastName">Last name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            required={!isSigningIn}
                                            value={form.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className={styles.gridRow}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="dateOfBirth">Date of birth</label>
                                        <input
                                            type="date"
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            required={!isSigningIn}
                                            value={form.dateOfBirth}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required={!isSigningIn}
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="username">{isSigningIn && "Email or "}Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    required
                                    value={form.username}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>

                            {!isSigningIn && (
                                <div className={styles.inputGroup}>
                                    <label htmlFor="confirmPassword">Confirm password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        required
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <button type="submit" className={styles.loginButton}>
                                {isSigningIn ? "Login" : "Create Account"}
                            </button>

                            {error && <h2 className={styles.error}>{error}</h2>}
                            {message && <h2 className={styles.message}>{message}</h2>}

                            <div className={styles.divider}>
                                <span>or continue with</span>
                            </div>

                            <div className={styles.oauthContainer}>
                                <button
                                    type="button"
                                    className={styles.oauthButton}
                                    onClick={() => handleOAuthLogin("google")}
                                >
                                    <FaGoogle width={20} height={20}/>
                                    Google
                                </button>

                                <button
                                    type="button"
                                    className={styles.oauthButton}
                                    onClick={() => handleOAuthLogin("github")}
                                >
                                    <FaGithub width={20} height={20}/>
                                    GitHub
                                </button>
                            </div>

                            <p className={styles.toggleText}>
                                {isSigningIn ? "Don't have an account?" : "Already have an account?"}{" "}
                                <span onClick={() => setIsSigningIn(!isSigningIn)} className={styles.toggleLink}>
                                {isSigningIn ? "Sign up" : "Login"}
                            </span>
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </RequireGuest>
    );
}

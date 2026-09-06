"use client";

import React, {useEffect, useState} from "react";
import LogoSmall from "@/assets/logo-small.svg";
import Moon from "@/assets/Moon_fill.svg"
import Sun from "@/assets/Sun_fill.svg"
import Image from "next/image";
import styles from "./navbar.module.scss";
import {CiLogin, CiSettings} from "react-icons/ci";
import Link from "next/link";
import {FaImages, FaUser} from "react-icons/fa";
import {useAuth} from "@/context/authContext";
import {IoLogOutOutline} from "react-icons/io5";

function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            document.body.dataset.theme = savedTheme;
            setIsDarkMode(savedTheme === "dark");
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.body.dataset.theme = prefersDark ? "dark" : "light";
            setIsDarkMode(prefersDark);
        }
    }, []);

    function toggleTheme() {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.body.dataset.theme = newMode ? "dark" : "light";
        localStorage.setItem("theme", newMode ? "dark" : "light");
    }

    return (
        <header id="navbar" className={styles.stickyNavStyle}>
            <div className={styles.main}>
                <div className={styles.leftSection}>
                    <Link className={styles.logo} href="/">
                        <Image src={LogoSmall} alt={"Logo"} width={80} height={40} />
                        <h3>ImageUpload</h3>
                    </Link>

                    <Link className={styles.navLink} href="/globalUploads">
                        <FaImages size={30} />
                    </Link>
                    {isAuthenticated && (
                        <Link className={styles.navLink} href="/myUploads">
                            <FaUser size={30} />
                        </Link>
                    )}
                </div>

                <div className={styles.controls}>
                    <button
                        className={styles.controlButton}
                        onClick={toggleTheme}
                        aria-label={isDarkMode ? 'Change to light mode' : 'Change to dark mode'}
                    >
                        {isDarkMode ?
                            <Image src={Sun} alt="Light Mode" width={30} height={30} />
                            :
                            <Image src={Moon} alt="Dark Mode" width={30} height={30} />
                        }
                    </button>

                    {isAuthenticated &&(
                        <Link href="/settings">
                            <button className={styles.controlButton} aria-label="Settings">
                                <CiSettings size={30} color="currentColor" />
                            </button>
                        </Link>
                    )}

                    {!isAuthenticated && (
                        <Link href="/login">
                            <button className={styles.controlButton}>
                                <CiLogin size={30} color="currentColor" />
                            </button>
                        </Link>
                    )}

                    {isAuthenticated && (
                        <button className={styles.controlButton} onClick={logout} aria-label="Logout">
                            <IoLogOutOutline size={30} color="currentColor" />
                        </button>
                    )}

                </div>
            </div>
        </header>
    )
}

export default Navbar;
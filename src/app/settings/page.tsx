'use client';

import React, { useEffect } from 'react';
import styles from './page.module.scss';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';

function SettingsPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [error, setError] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    function formatDateUTC(dateString: string) {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toUTCString().split(' ').slice(0, 4).join(' ');
    }

    if (!user) return null;

    const handleDeleteAccount = async () => {
        setError("Dangerous action disabled.");
        setMessage("Account deletion is not implemented yet.");
    };

    return (
        <section id="user-settings" className={styles.page}>
            <div className={styles.content}>
                <div className={styles.profileCard}>
                    <h2 className={styles.title}>My profile</h2>

                    <div className={styles.infoGrid}>
                        <div className={styles.field}>
                            <label>Name</label>
                            <div>{user.firstName}</div>
                        </div>

                        <div className={styles.field}>
                            <label>Last name</label>
                            <div>{user.lastName}</div>
                        </div>

                        <div className={styles.field}>
                            <label>Username</label>
                            <div>{user.username ?? '-'}</div>
                        </div>

                        <div className={styles.field}>
                            <label>Email</label>
                            <div>{user.email ?? '-'}</div>
                        </div>

                        <div className={styles.field}>
                            <label>Date of birth</label>
                            <div>{formatDateUTC(user.dateOfBirth) ?? '-'}</div>
                        </div>

                        <div className={styles.field}>
                            <label>ID</label>
                            <div>{user.id ?? '-'}</div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.logoutButton} onClick={handleDeleteAccount}>
                            Delete account
                        </button>
                    </div>

                    {error && <h2 className={styles.error}>{error}</h2>}
                    {message && <h2 className={styles.message}>{message}</h2>}
                </div>
            </div>
        </section>
    )
}

export default SettingsPage;
'use client';

import React, { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';

export default function RequireGuest({ children }: PropsWithChildren) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            if (typeof window === 'undefined' || window.history.length <= 1) {
                router.replace('/');
            }
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated) return null;

    return <>{children}</>;
}
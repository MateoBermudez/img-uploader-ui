'use client';

import styles from "./page.module.scss";
import MediaMasonry from "@/components/imagesMasonry/mediaMasonry";
import {ImageItem} from "@/types/image";
import {useAuth} from "@/context/authContext";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import {apiClient} from "@/services/apliClient";
import {RawImageDto} from "@/types/rawImageDto";
import {backendUrls} from "@/types/constants";

function MyUploadsPage() {
    const {user, isAuthenticated} = useAuth();
    const router = useRouter();
    const [images, setImages] = React.useState<ImageItem[]>([]);

    useEffect((): void => {
        if (!isAuthenticated) {
            return router.push('/login');
        }
        if (!user) return router.push('/login');

        const fetchImages = async () => {
            try {
                const result = await apiClient.get(backendUrls.getUserMedia, {
                    params: { page: 1, limit: 100 },
                    withCredentials: true
                });

                const mapped: ImageItem[] = (result.data || []).map((i: RawImageDto) => ({
                    id: i.id,
                    src: i.url,
                    alt: i.filename ?? undefined,
                    width: i.width,
                    height: i.height
                }));
                setImages(mapped);
            } catch (err) {
                console.error('Failed to fetch images', err);
            }
        };

        fetchImages().then(() => {});
    }, [isAuthenticated, router, user]);

    if (!user) return null;

    return (
        <section id="all-images" className={styles.page}>
            <MediaMasonry images={images} />
        </section>
    );
}

export default MyUploadsPage;
'use client';

import styles from "./page.module.scss";
import MediaMasonry from "@/components/imagesMasonry/mediaMasonry";
import {ImageItem} from "@/types/image";
import {useEffect, useState} from "react";
import {apiClient} from "@/services/apliClient";
import {RawImageDto} from "@/types/rawImageDto";
import {backendUrls} from "@/types/constants";

function GlobalUploadsPage() {
    const [images, setImages] = useState<ImageItem[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const result = await apiClient.get(backendUrls.getAllMedia, {
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
    }, []);

    return (
        <section id="all-images" className={styles.page}>
            <MediaMasonry images={images} />
        </section>
    );
}

export default GlobalUploadsPage;
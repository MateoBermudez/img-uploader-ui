import styles from "./mediaMasonry.module.scss";
import {ImageItem} from "@/types/image";

interface Props {
    images: ImageItem[];
}

function MediaMasonry({ images }: Props) {
    function toURL(src: string): URL | null {
        try {
            return new URL(src);
        } catch {
            return null;
        }
    }

    function isMediaDeliveryEmbed(src: string): boolean {
        const u = toURL(src);
        return !!u && u.hostname === "iframe.mediadelivery.net" && u.pathname.includes("/embed/");
    }

    return (
        <main className={styles.container}>
            <div className={styles.masonry}>
                {images.map((img) => (
                    <figure key={img.id} className={styles.masonryItem}>
                        {!isMediaDeliveryEmbed(img.src) ? (
                            <img
                                src={img.src}
                                alt={img.alt ?? "Imagen"}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className={styles.videoWrapper}>
                                <iframe
                                    className={styles.videoFrame}
                                    src={img.src}
                                    loading="lazy"
                                    allow="fullscreen; picture-in-picture"
                                    allowFullScreen
                                    referrerPolicy="no-referrer"
                                    title={img.alt ?? "Video"}
                                />
                            </div>
                        )}
                    </figure>
                ))}
            </div>
        </main>
    )
}

export default MediaMasonry;
import React from "react";
import styles from "./loading.module.scss";

interface Props {
    status?: string;
}

function Loading({ status }: Props) {
    return (
        <section
            id="loading-image"
            className={styles.container}
        >
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Uploading, <span>please wait...</span>
                </h2>
                {status && <h3 className={styles.status}>{status}</h3>}
                <div
                    className={styles.progress}
                    role="progressbar"
                    aria-busy="true"
                    aria-label="Uploading image"
                />
            </div>
        </section>
    );
}

export default Loading;
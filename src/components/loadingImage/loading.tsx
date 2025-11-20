import React from "react";
import styles from "./loading.module.scss";

function Loading() {
    return (
        <section
            id="loading-image"
            className={styles.container}
        >
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Uploading, <span>please wait...</span>
                </h2>
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
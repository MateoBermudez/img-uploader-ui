import styles from "./page.module.scss";
import MediaUploadBox from "@/components/imageUploadBox/mediaUploadBox";

export default function Home() {
  return (
    <section id="upload-image" className={styles.page}>
        <div className={styles.content}>
            <MediaUploadBox />
        </div>
    </section>
  );
}

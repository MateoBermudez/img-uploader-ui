"use client";

import React, {useEffect, useRef, useState} from "react";
import styles from "./mediaUploadBox.module.scss";
import Upload from "@/assets/exit.svg";
import Image from "next/image";
import Download from "@/assets/download.svg"
import Loading from "@/components/loadingImage/loading";
import {MdDeleteForever} from "react-icons/md";
import {apiClient} from "@/services/apliClient";
import {ApiError} from "@/types/apiError";
import {backendUrls, shortPolling, successStatusCodes, videoStatusCodes} from "@/types/constants";

type MediaKind = "image" | "video" | null;

function MediaUploadBox() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [isMediaLoaded, setIsMediaLoaded] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [mediaKind, setMediaKind] = useState<MediaKind>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);
    const [loadStatus, setLoadStatus] = useState<string>("Initializing...");


    const handleFile = (nextFile: File | null | undefined) => {
        if (!nextFile) return;

        setIsLoading(true);
        setIsMediaLoaded(false);
        setError("");
        setMessage("");

        const isImage = nextFile.type.startsWith("image/");
        const isVideo = nextFile.type.startsWith("video/");

        if (!isImage && !isVideo) {
            setError("Only image and video files are allowed.");
            setPreview(null);
            setIsLoading(false);
            return;
        }

        const maxImageSize = 2 * 1024 * 1024;
        const maxVideoSize = 500 * 1024 * 1024;

        if (isImage && nextFile.size > maxImageSize) {
            setError("Image exceeds 2MB.");
            setPreview(null);
            setIsLoading(false);
            return;
        }
        if (isVideo && nextFile.size > maxVideoSize) {
            setError("Video exceeds 500MB.");
            setPreview(null);
            setIsLoading(false);
            return;
        }

        const url = URL.createObjectURL(nextFile);
        setPreview(url);
        setFile(nextFile);
        setIsLoading(false);
        setIsMediaLoaded(true);
        setMediaKind(isImage ? "image" : "video");
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        handleFile(file);
    };

    const handleClick = () => fileInputRef.current?.click();

    const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!preview || !file) return;
        try {
            const formData = new FormData();
            formData.append("file", file);

            setIsLoading(true);
            setIsMediaLoaded(false);

            const isVideo = file.type.startsWith("video/");

            const path = isVideo ? backendUrls.uploadVideo : backendUrls.uploadImage;

            const response = await apiClient.post(path, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            const status: number = response.status;
            const { type, videoUuid } = response.data;

            if (successStatusCodes.has(status)) {
                if (type === 'video' && videoUuid) {
                    setMessage("Processing Video...");
                    startVideoStatusPolling(videoUuid);
                } else {
                    setMessage("Successfully uploaded!");
                    setIsMediaLoaded(true);
                    setIsLoading(false);
                    setTimeout(() => {
                        setPreview(null);
                        setFile(null);
                        setMessage("");
                    }, 5000);
                }
            } else {
                setError("Upload failed. Please try again.");
                setIsLoading(false);
                setIsMediaLoaded(true);
            }

        } catch (err: unknown) {
            const apiErr = err as ApiError;
            const apiMsg: string =
                apiErr?.response?.data?.message ||
                apiErr?.message ||
                "An error occurred. Please try again.";
            setError(apiMsg);
            setIsLoading(false);
            setIsMediaLoaded(true);
        }
    }

    const startVideoStatusPolling = (videoId: string) => {
        let attempts: number = 0;
        const maxAttempts = shortPolling.maxAttempts;
        setIsLoading(true);
        setIsMediaLoaded(false);

        const tick = async (): Promise<void> => {
            try {
                const resp = await apiClient.get(`${backendUrls.getVideoStatus}${videoId}`, { withCredentials: true });
                const status: number = resp.data?.status?.code;
                const statusName: string = resp.data?.status?.name;
                setLoadStatus(statusName);
                if (status === videoStatusCodes.FINISHED) {
                    setMessage("Video processing complete!");
                    setIsLoading(false);
                    setIsMediaLoaded(true);
                    stopVideoStatusPolling();
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        setError("Video processing timed out. Please try again later.");
                        setIsLoading(false);
                        setIsMediaLoaded(true);
                        stopVideoStatusPolling();
                    }
                }
            } catch {
                setError("Error checking video status.");
                setIsLoading(false);
                setIsMediaLoaded(true);
                stopVideoStatusPolling();
            }
        };

        stopVideoStatusPolling();
        pollRef.current = setInterval(tick, shortPolling.intervalMs);
        tick().then(() => {});
    };

    const stopVideoStatusPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    useEffect(() => {
        return () => stopVideoStatusPolling();
    }, []);

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        stopVideoStatusPolling();
        setIsMediaLoaded(false);
        setIsLoading(false);
        setPreview(null);
        setFile(null);
        setError("");
        setMessage("");
        setMediaKind(null);
        setLoadStatus("Initializing...");
    };

    return (
        isLoading ? (
            <Loading status={loadStatus}/>
        ) : (
            <section
                id="image-upload-box"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={handleClick}
            >
                {!preview ? (
                    <div className={styles.imageUploadBoxLower}>
                        <div className={styles.imageUploadBox}>
                            <Image src={Upload} alt="Upload Icon" width={32} height={32}/>
                            <h2>
                                Drag & drop a file or{" "}
                                <span className={styles.browseText}>browse files</span>
                            </h2>
                            <p>JPG, PNG or GIF - Max file size 2MB</p>
                            {error && <h2 className={styles.error}>{error}</h2>}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className={styles.imageUploadBoxLower}>
                            <div className={styles.previewContainer}>
                                {mediaKind === "image" && (
                                    <img
                                        src={preview as string}
                                        alt="Preview"
                                        className={`${styles.previewImage} ${isMediaLoaded ? styles.loaded : ""}`}
                                    />
                                )}

                                {mediaKind === "video" && (
                                    <video
                                        src={preview as string}
                                        controls
                                        className={`${styles.previewImage} ${isMediaLoaded ? styles.loaded : ""}`}
                                    />
                                )}
                            </div>
                            {error && <h2 className={styles.error}>{error}</h2>}
                            {message && <h2 className={styles.message}>{message}</h2>}
                        </div>

                        <div className={styles.buttonContainer}>
                            <button
                                type="button"
                                className={styles.blueButton}
                                onClick={handleUpload}
                            >
                                <Image src={Download} alt="Download Icon" width={16} height={16}/>
                                Upload
                            </button>
                            <button
                                type="button"
                                className={styles.redButton}
                                onClick={handleRemove}
                            >
                                <MdDeleteForever/>
                                Remove
                            </button>
                        </div>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
                    ref={fileInputRef}
                    style={{display: "none"}}
                    onChange={handleChange}
                />
            </section>
        )
    );
}

export default MediaUploadBox;

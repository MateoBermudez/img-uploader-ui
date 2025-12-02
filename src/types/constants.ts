export const backendUrls = {
    getAllMedia: '/media/all/page',
    getUserMedia: '/media/user/all',
    uploadVideo: '/media/upload/video',
    uploadImage: '/media/upload/image',
    getVideoStatus: '/media/video/get-status/',
    login: '/auth/login',
    refresh: '/auth/refresh',
    signup: '/auth/signup',
    logoutBase: '/auth/logout',
    logoutOAuth: '/auth/oauth/logout',
    getUserInfo: '/auth/me',
} as const;

export const successStatusCodes = new Set([200, 201, 202, 204, 206]);

export const shortPolling = {
    maxAttempts: 30,
    intervalMs: 5000,
} as const;

export const videoStatusCodes = {
    QUEUED: 0,
    PROCESSING: 1,
    ENCODING: 2,
    FINISHED: 3,
    RESOLUTION_FINISHED: 4,
    FAILED: 5,
    PRESIGNED_UPLOAD_STARTED: 6,
    PRESIGNED_UPLOAD_FINISHED: 7,
    PRESIGNED_UPLOAD_FAILED: 8,
    CAPTIONS_GENERATED: 9,
    TITLE_OR_DESCRIPTION_GENERATED: 10,
} as const;

export const mediaDeliveryHostnames = new Set<string>([
    'iframe.mediadelivery.net',
]);

export const mediaDeliveryEmbedSegment = '/embed/' as const;
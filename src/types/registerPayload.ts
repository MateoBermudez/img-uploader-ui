export type RegisterPayload = {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email?: string;
    username?: string;
    password: string;
    confirmPassword?: string;
};
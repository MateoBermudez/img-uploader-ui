export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email?: string;
    username?: string;
    passwordHash: string;
}
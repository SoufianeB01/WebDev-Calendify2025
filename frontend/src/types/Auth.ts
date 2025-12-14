export interface AuthEntry {
    userId: number;
    email: string;
    accessToken: string;
    refreshToken: string;
    accessExpiresAt: Date;
    refreshExpiresAt: Date;
}

export interface SessionEntry {
    sessionId: string;
    userId: number;
    accessToken: string;
    refreshToken: string;
    accessExpiresAt: Date;
    refreshExpiresAt: Date;
}

export interface UserSession {
    user: {
        userId: number;
        email: string;
        firstName: string;
        lastName: string;
        role: "Admin" | "Employee";
    };
    session: SessionEntry;
}

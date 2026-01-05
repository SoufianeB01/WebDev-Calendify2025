import { z } from "zod";

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

// Login schema
export const loginSchema = z.object({
    email: z.string()
        .min(1, "E-mailadres is verplicht")
        .max(50, "E-mailadres kan niet langer zijn dan 50 karakters")
        .email("E-mailadres is ongeldig"),
    password: z.string()
        .min(1, "Wachtwoord is verplicht")
        .max(50, "Wachtwoord kan niet langer zijn dan 50 karakters"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
    name: z.string()
        .min(2, "Naam moet minimaal 2 karakters zijn")
        .max(100, "Naam kan niet langer zijn dan 100 karakters"),
    email: z.string()
        .min(1, "E-mailadres is verplicht")
        .max(50, "E-mailadres kan niet langer zijn dan 50 karakters")
        .email("E-mailadres is ongeldig"),
    password: z.string()
        .min(6, "Wachtwoord moet minimaal 6 karakters zijn")
        .max(50, "Wachtwoord kan niet langer zijn dan 50 karakters"),
    confirmPassword: z.string()
        .min(1, "Bevestig uw wachtwoord"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof registerSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
    email: z.string().min(1, 'E-mailadres is verplicht').email('Ongeldig e-mailadres'),
    password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
    confirmPassword: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['confirmPassword'],
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

import { z } from "zod";

// User profile schema
export const userProfileSchema = z.object({
    userId: z.number(),
    firstName: z.string().min(1, "Voornaam is verplicht").max(50, "Voornaam mag maximaal 50 tekens bevatten"),
    lastName: z.string().min(1, "Achternaam is verplicht").max(50, "Achternaam mag maximaal 50 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
    role: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Update profile schema
export const updateProfileSchema = z.object({
    firstName: z.string().min(1, "Voornaam is verplicht").max(50, "Voornaam mag maximaal 50 tekens bevatten"),
    lastName: z.string().min(1, "Achternaam is verplicht").max(50, "Achternaam mag maximaal 50 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// Change password schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Huidig wachtwoord is verplicht"),
    newPassword: z.string().min(6, "Nieuw wachtwoord moet minimaal 6 tekens bevatten").max(100, "Wachtwoord mag maximaal 100 tekens bevatten"),
    confirmPassword: z.string().min(1, "Bevestig wachtwoord is verplicht"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;

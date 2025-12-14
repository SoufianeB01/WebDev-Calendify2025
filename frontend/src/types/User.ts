import { z } from "zod";

// User schema
export const userSchema = z.object({
    userId: z.number(),
    firstName: z.string().min(1, "Voornaam is verplicht").max(50, "Voornaam mag maximaal 50 tekens bevatten"),
    lastName: z.string().min(1, "Achternaam is verplicht").max(50, "Achternaam mag maximaal 50 tekens bevatten"),
    username: z.string().min(3, "Gebruikersnaam moet minimaal 3 tekens bevatten").max(50, "Gebruikersnaam mag maximaal 50 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
    role: z.enum(["Admin", "Employee"]),
    password: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// Create user schema (for adding new users)
export const createUserSchema = z.object({
    firstName: z.string().min(1, "Voornaam is verplicht").max(50, "Voornaam mag maximaal 50 tekens bevatten"),
    lastName: z.string().min(1, "Achternaam is verplicht").max(50, "Achternaam mag maximaal 50 tekens bevatten"),
    username: z.string().min(3, "Gebruikersnaam moet minimaal 3 tekens bevatten").max(50, "Gebruikersnaam mag maximaal 50 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
    password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten").max(100, "Wachtwoord mag maximaal 100 tekens bevatten"),
    role: z.enum(["Admin", "Employee"]),
});

export type CreateUser = z.infer<typeof createUserSchema>;

// Update user schema (for editing users)
export const updateUserSchema = z.object({
    firstName: z.string().min(1, "Voornaam is verplicht").max(50, "Voornaam mag maximaal 50 tekens bevatten"),
    lastName: z.string().min(1, "Achternaam is verplicht").max(50, "Achternaam mag maximaal 50 tekens bevatten"),
    username: z.string().min(3, "Gebruikersnaam moet minimaal 3 tekens bevatten").max(50, "Gebruikersnaam mag maximaal 50 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
    password: z.string().max(100, "Wachtwoord mag maximaal 100 tekens bevatten").refine(
        (val) => val.length === 0 || val.length >= 6,
        { message: "Wachtwoord moet minimaal 6 tekens bevatten" }
    ),
    role: z.enum(["Admin", "Employee"]),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;

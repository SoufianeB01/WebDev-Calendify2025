import { z } from "zod";

// User schema
export const userSchema = z.object({
    userId: z.string(),
    name: z.string().min(1, "Naam is verplicht").max(100, "Naam mag maximaal 100 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
    role: z.enum(["Admin", "Employee"]),
    password: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// Create user schema (for adding new users)
export const createUserSchema = z.object({
    name: z.string().min(1, "Naam is verplicht").max(100, "Naam mag maximaal 100 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
    password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten").max(100, "Wachtwoord mag maximaal 100 tekens bevatten"),
    role: z.enum(["Admin", "Employee"]),
});

export type CreateUser = z.infer<typeof createUserSchema>;

// Update user schema (for editing users)
export const updateUserSchema = z.object({
    name: z.string().min(1, "Naam is verplicht").max(100, "Naam mag maximaal 100 tekens bevatten"),
    email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres").max(100, "E-mailadres mag maximaal 100 tekens bevatten"),
    password: z.string().max(100, "Wachtwoord mag maximaal 100 tekens bevatten").optional(),
    role: z.enum(["Admin", "Employee"]),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;

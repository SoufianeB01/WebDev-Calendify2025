import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { FormEvent } from "react";

import { useAppForm } from "@/hooks/use-app-form";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/types/Auth";

export const Route = createFileRoute("/_unauth/register/")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = Route.useNavigate();
    const router = useRouter();
    const queryClient = useQueryClient();

    const registerMutation = useMutation({
        mutationFn: async (data: { name: string; email: string; password: string }) => {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    role: "Employee"
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registratie mislukt');
            }

            return response.json();
        }
    });

    const form = useAppForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        onSubmit: async ({ value }) => {
            await registerMutation.mutateAsync({
                name: value.name,
                email: value.email,
                password: value.password,
            }, {
                onSuccess: () => {
                    toast.success("Account succesvol aangemaakt! U kunt nu inloggen.");
                    navigate({ to: '/login' });
                },
                onError: (error: any) => {
                    toast.error(error.message || "Registratie mislukt. Probeer het opnieuw.");
                },
                onSettled: async () => {
                    await router.invalidate();
                    await queryClient.invalidateQueries();
                },
            });
        },
        validators: {
            onSubmit: registerSchema,
        },
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.handleSubmit();
    }

    return (
        <div className="bg-card text-card-foreground flex flex-col gap-4 w-full sm:max-w-lg rounded-lg shadow-lg border-0 p-6">
            <h1 className="text-4xl">Registreren</h1>
            <h3 className="block text-base">Maak een nieuw account aan.</h3>
            <form.AppForm>
                <form
                    id="register-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-6 h-full text-muted-foreground"
                    noValidate
                >
                    <div className="flex flex-col gap-4 flex-1 min-h-0 text-sm text-muted-foreground">
                        <form.AppField
                            name="name"
                            children={(field) =>
                                <field.TextField
                                    label="Naam"
                                    type="text"
                                    placeholder="Voer uw volledige naam in &hellip;"
                                />
                            }
                        />
                        <form.AppField
                            name="email"
                            children={(field) =>
                                <field.TextField
                                    label="E-mailadres"
                                    type="email"
                                    placeholder="Voer uw e-mailadres in &hellip;"
                                />
                            }
                        />
                        <form.AppField
                            name="password"
                            children={(field) =>
                                <field.TextField
                                    label="Wachtwoord"
                                    type="password"
                                    placeholder="Voer uw wachtwoord in &hellip;"
                                />
                            }
                        />
                        <form.AppField
                            name="confirmPassword"
                            children={(field) =>
                                <field.TextField
                                    label="Bevestig wachtwoord"
                                    type="password"
                                    placeholder="Voer uw wachtwoord opnieuw in &hellip;"
                                />
                            }
                        />
                    </div>
                    <div className="flex gap-2 mt-auto">
                        <div className="flex flex-col h-full w-full">
                            <div className="flex flex-col gap-4 mt-auto">
                                <form.Subscribe
                                    selector={(state) => state.canSubmit}
                                    children={(canSubmit) => (
                                        <Button
                                            type="submit"
                                            disabled={!canSubmit || registerMutation.isPending}
                                            className="w-full flex-1 uppercase p-3"
                                            children={registerMutation.isPending ? "Registreren..." : "Registreren"}
                                        />
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full flex-1 uppercase p-3"
                                    onClick={() => navigate({ to: "/login" })}
                                    children="Terug naar inloggen"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </form.AppForm>
        </div >
    );
}

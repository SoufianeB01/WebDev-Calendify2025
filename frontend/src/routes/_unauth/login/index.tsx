import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import type { FormEvent } from "react";

import { useAppForm } from "@/hooks/use-app-form";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/types/Auth";

export const Route = createFileRoute("/_unauth/login/")({
    component: RouteComponent,
    validateSearch: z.object({
        redirectPath: z.string().optional(),
    }),
});

function RouteComponent() {
    const navigate = Route.useNavigate();
    const search = Route.useSearch();
    const router = useRouter();
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            return response.json();
        }
    });

    const form = useAppForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            await loginMutation.mutateAsync({
                email: value.email,
                password: value.password,
            }, {
                onSuccess: async () => {
                    toast.success("U bent succesvol ingelogd.");
                    // Clear all queries and router cache before navigation
                    queryClient.clear();
                    await router.invalidate();
                    // Navigate to events page after cache is cleared
                    await navigate({ to: search.redirectPath || '/events' });
                },
                onError: () => {
                    toast.error("U kon niet worden ingelogd. Controleer de invoer en probeer het opnieuw.");
                },
            });
        },
        validators: {
            onSubmit: loginSchema,
        },
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.handleSubmit();
    }

    return (
        <div className="bg-card text-card-foreground flex flex-col gap-4 w-full sm:max-w-lg rounded-lg shadow-lg border-0 p-6">
            <h1 className="text-4xl">Inloggen</h1>
            <h3 className="block text-base">Welkom terug! Voer uw gegevens in.</h3>
            <form.AppForm>
                <form
                    id="login-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-6 h-full text-muted-foreground"
                    noValidate
                >
                    <div className="flex flex-col gap-4 flex-1 min-h-0 text-sm text-muted-foreground">
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
                    </div>
                    <div className="flex gap-2 mt-auto">
                        <div className="flex flex-col h-full w-full">
                            <div className="flex flex-col gap-4 mt-auto">
                                <form.Subscribe
                                    selector={(state) => state.canSubmit}
                                    children={(canSubmit) => (
                                        <Button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className="w-full flex-1 uppercase p-3"
                                            children="Inloggen"
                                        />
                                    )}
                                />
                                <Button
                                    type="button"
                                    className="w-full flex-1 uppercase p-3"
                                    onClick={() => navigate({ to: "/password-reset" })}
                                    children="Wachtwoord resetten"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full flex-1 uppercase p-3"
                                    onClick={() => navigate({ to: "/register" })}
                                    children="Registreren"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </form.AppForm>
        </div >
    );
}

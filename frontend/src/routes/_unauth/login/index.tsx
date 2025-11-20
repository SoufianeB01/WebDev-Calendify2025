// import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import type { FormEvent } from "react";

import { useAppForm } from "@/hooks/use-app-form";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_unauth/login/")({
    component: RouteComponent,
    validateSearch: z.object({
        redirectPath: z.string().optional(),
    }),
});

function RouteComponent() {
    const navigate = Route.useNavigate();
    const search = Route.useSearch();
    // const router = useRouter();
    // const queryClient = useQueryClient();

    const form = useAppForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: (/* { value }*/) => {
            localStorage.setItem('isAuthenticated', 'true');
            // const respone = await authClient.signIn.email({
            //     email: value.email,
            //     password: value.password,
            // });

            // if (respone.error) {
            //     toast.error("U kon niet worden ingelogd. Controleer de invoer en probeer het opnieuw.");
            //     return;
            // }

            // await router.invalidate();
            // await queryClient.invalidateQueries();

            // Show success message
            toast.success("U bent succesvol ingelogd.");

            // redirect to the intended page or home
            navigate({ to: search.redirectPath || '/' });
        },
        onSubmitInvalid: () => {
            toast.error("U kon niet worden ingelogd. Controleer de invoer en probeer het opnieuw.");
        },
        validators: {
            onSubmit: z.object({
                email: z.string()
                    .min(1, "E-mailadres is verplicht")
                    .max(50, "E-mailadres kan niet langer zijn dan 50 karakters")
                    .email("E-mailadres is ongeldig"),
                password: z.string()
                    .min(1, "Wachtwoord is verplicht")
                    .max(50, "Wachtwoord kan niet langer zijn dan 50 karakters"),
            }),
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
                                            className="cursor-pointer w-full flex-1 uppercase p-3"
                                            children="Inloggen"
                                        />
                                    )}
                                />
                                <Button
                                    type="button"
                                    className="cursor-pointer w-full flex-1 uppercase p-3"
                                    onClick={() => navigate({ to: "/password-forgot" })}
                                    children="Wachtwoord vergeten"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </form.AppForm>
        </div >
    );
}

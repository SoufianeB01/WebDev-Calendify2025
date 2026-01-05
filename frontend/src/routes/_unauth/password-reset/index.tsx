import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { FormEvent } from 'react';
import { useAppForm } from '@/hooks/use-app-form';

import { Button } from '@/components/ui/button';
import { resetPasswordSchema } from '@/types/Auth';

export const Route = createFileRoute('/_unauth/password-reset/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: value.email,
            password: value.password
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to reset password');
        }

        toast.success('Wachtwoord succesvol gewijzigd');
        navigate({ to: '/login' });
      } catch (error: any) {
        toast.error(error.message || 'Gebruiker niet gevonden of fout bij resetten');
      }
    },
    validators: {
      onSubmit: resetPasswordSchema
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    form.handleSubmit();
  }

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-4 w-full sm:max-w-lg rounded-lg shadow-lg border-0 p-6">
      <h1 className="text-4xl">Wachtwoord resetten</h1>
      <h3 className="block text-base">Voer uw email en nieuw wachtwoord in.</h3>
      <form.AppForm>
        <form
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
                  label="Nieuw wachtwoord"
                  type="password"
                  placeholder="Minimaal 6 karakters &hellip;"
                />
              }
            />
            <form.AppField
              name="confirmPassword"
              children={(field) =>
                <field.TextField
                  label="Bevestig wachtwoord"
                  type="password"
                  placeholder="Voer wachtwoord opnieuw in &hellip;"
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
                      children="Wachtwoord wijzigen"
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
    </div>
  );
}

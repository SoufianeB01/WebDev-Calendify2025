import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/types/UserProfile";
import { changePasswordSchema, updateProfileSchema } from "@/types/UserProfile";
import { useAppForm } from "@/hooks/use-app-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_auth/profile/")({
  component: RouteComponent,
});

export function RouteComponent() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5143";

  const { data: userData = null } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Kon profiel niet ophalen");
      return res.json() as Promise<UserProfile>;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Fout bij bijwerken profiel");
      return res.json() as Promise<UserProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditDialogOpen(false);
      toast.success("Profiel succesvol bijgewerkt");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Fout bij bijwerken profiel");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch(`${API_BASE}/api/user/password`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Fout bij wijzigen wachtwoord");
      return res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast.success("Wachtwoord succesvol gewijzigd");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Fout bij wijzigen wachtwoord");
    },
  });

  const profileForm = useAppForm({
    defaultValues: { firstName: "", lastName: "", email: "" },
    onSubmit: ({ value }) => {
      updateProfileMutation.mutate(value);
    },
    validators: { onSubmit: updateProfileSchema },
  });

  const passwordForm = useAppForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    onSubmit: ({ value }) => {
      changePasswordMutation.mutate({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword
      });
    },
    validators: { onSubmit: changePasswordSchema },
  });

  if (!userData) return <p className="text-center py-8">Profiel wordt geladen...</p>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Mijn profiel</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profielinformatie</CardTitle>
            <CardDescription>Bekijk en bewerk uw persoonlijke gegevens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Voornaam</Label>
                <p className="text-lg font-medium">{userData.firstName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Achternaam</Label>
                <p className="text-lg font-medium">{userData.lastName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">E-mail</Label>
                <p className="text-lg font-medium">{userData.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rol</Label>
                <p className="text-lg font-medium">{userData.role}</p>
              </div>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    profileForm.setFieldValue("firstName", userData.firstName);
                    profileForm.setFieldValue("lastName", userData.lastName);
                    profileForm.setFieldValue("email", userData.email);
                  }}>
                    Profiel bewerken
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <profileForm.AppForm>
                    <form onSubmit={(e) => { e.preventDefault(); profileForm.handleSubmit(); }} noValidate>
                      <DialogHeader>
                        <DialogTitle>Profiel bewerken</DialogTitle>
                        <p className="text-sm text-muted-foreground">Pas uw persoonlijke gegevens aan</p>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <profileForm.AppField name="firstName" children={(field) => <field.TextField label="Voornaam" type="text" />} />
                        <profileForm.AppField name="lastName" children={(field) => <field.TextField label="Achternaam" type="text" />} />
                        <profileForm.AppField name="email" children={(field) => <field.TextField label="E-mail" type="text" />} />
                      </div>
                      <DialogFooter>
                        <profileForm.Subscribe selector={(state) => state.canSubmit} children={(canSubmit) => <Button type="submit" disabled={!canSubmit}>Opslaan</Button>} />
                      </DialogFooter>
                    </form>
                  </profileForm.AppForm>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wachtwoord wijzigen</CardTitle>
            <CardDescription>Werk uw wachtwoord bij voor extra beveiliging</CardDescription>
          </CardHeader>
          <CardContent>
            <passwordForm.AppForm>
              <form onSubmit={(e) => { e.preventDefault(); passwordForm.handleSubmit(); }} noValidate className="space-y-4">
                <passwordForm.AppField name="currentPassword" children={(field) => <field.TextField label="Huidig wachtwoord" type="password" />} />
                <passwordForm.AppField name="newPassword" children={(field) => <field.TextField label="Nieuw wachtwoord" type="password" />} />
                <passwordForm.AppField name="confirmPassword" children={(field) => <field.TextField label="Bevestig nieuw wachtwoord" type="password" />} />
                <passwordForm.Subscribe selector={(state) => state.canSubmit} children={(canSubmit) => <Button type="submit" disabled={!canSubmit}>Wachtwoord wijzigen</Button>} />
              </form>
            </passwordForm.AppForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

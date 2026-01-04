import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PencilIcon, PlusIcon, ShieldIcon, TrashIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import type { User } from "@/types/User";
import { createUserSchema, updateUserSchema } from "@/types/User";
import { useAppForm } from "@/hooks/use-app-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute('/_auth/users/')({
  component: RouteComponent,
});

export default function RouteComponent() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5143";

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/employees`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Gebruikers konden niet worden geladen");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUserForm = useAppForm({
    defaultValues: { name: "", email: "", role: "Employee" as "Admin" | "Employee", password: "" },
    validators: { onSubmit: createUserSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await fetch(`${API_BASE}/api/employees`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });
        if (!res.ok) throw new Error("Failed to create employee");
        const newUser = await res.json();
        setUsers(prev => [...prev, newUser]);
        toast.success("Gebruiker succesvol aangemaakt");
        setIsAddDialogOpen(false);
        addUserForm.reset();
      } catch {
        toast.error("Gebruiker aanmaken mislukt");
      }
    }
  });

  const editUserForm = useAppForm({
    defaultValues: { name: "", email: "", role: "Employee" as "Admin" | "Employee", password: "" },
    validators: { onSubmit: updateUserSchema },
    onSubmit: async ({ value }) => {
      if (!selectedUser) return;
      const body = { ...value };
      if (!body.password) delete body.password;

      try {
        const res = await fetch(`${API_BASE}/api/employees/${selectedUser.userId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update employee");
        const updated = await res.json();
        setUsers(prev => prev.map(u => (u.userId === updated.userId ? updated : u)));
        toast.success("Gebruiker succesvol bijgewerkt");
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        editUserForm.reset();
      } catch {
        toast.error("Gebruiker bijwerken mislukt");
      }
    }
  });

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Weet u zeker dat u deze gebruiker wilt verwijderen?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/employees/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete employee");
      setUsers(prev => prev.filter(u => u.userId !== userId));
      toast.success("Gebruiker succesvol verwijderd");
    } catch {
      toast.error("Gebruiker verwijderen mislukt");
    }
  };

  const getRoleBadge = (role: string) =>
    role === "Admin" ? (
      <Badge className="bg-purple-500"><ShieldIcon className="h-3 w-3 mr-1" /> Admin</Badge>
    ) : (
      <Badge variant="secondary"><UserIcon className="h-3 w-3 mr-1" /> Employee</Badge>
    );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gebruikersbeheer</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Nieuwe gebruiker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <addUserForm.AppForm>
              <form onSubmit={e => { e.preventDefault(); addUserForm.handleSubmit(); }} noValidate>
                <DialogHeader>
                  <DialogTitle>Nieuwe gebruiker aanmaken</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">Vul de gegevens in voor de nieuwe gebruiker</p>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <addUserForm.AppField name="name">{field => <field.TextField label="Naam" type="text" />}</addUserForm.AppField>
                  <addUserForm.AppField name="email">{field => <field.TextField label="E-mail" type="text" />}</addUserForm.AppField>
                  <addUserForm.AppField name="password">{field => <field.TextField label="Wachtwoord" type="password" />}</addUserForm.AppField>
                  <addUserForm.AppField name="role">{field => (
                    <div>
                      <Label htmlFor={field.name}>Rol</Label>
                      <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as "Admin" | "Employee")}>
                        <SelectTrigger><SelectValue placeholder="Selecteer rol" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employee">Employee</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive mt-1">{String(field.state.meta.errors[0])}</p>}
                    </div>
                  )}</addUserForm.AppField>
                </div>
                <DialogFooter>
                  <addUserForm.Subscribe selector={state => state.canSubmit}>{canSubmit => (
                    <Button type="submit" disabled={!canSubmit}>Aanmaken</Button>
                  )}</addUserForm.Subscribe>
                </DialogFooter>
              </form>
            </addUserForm.AppForm>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gebruikers</CardTitle>
          <CardDescription>Beheer alle gebruikers in het systeem</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Geen gebruikers gevonden</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" /> {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedUser(user);
                          editUserForm.setFieldValue("name", user.name);
                          editUserForm.setFieldValue("email", user.email);
                          editUserForm.setFieldValue("role", user.role);
                          editUserForm.setFieldValue("password", "");
                          setIsEditDialogOpen(true);
                        }}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.userId)}>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <editUserForm.AppForm>
            <form onSubmit={e => { e.preventDefault(); editUserForm.handleSubmit(); }} noValidate>
              <DialogHeader>
                <DialogTitle>Gebruiker bewerken</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Bewerk de gebruikersgegevens</p>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <editUserForm.AppField name="name">{field => <field.TextField label="Naam" type="text" />}</editUserForm.AppField>
                <editUserForm.AppField name="email">{field => <field.TextField label="E-mail" type="text" />}</editUserForm.AppField>
                <editUserForm.AppField name="password">{field => <field.TextField label="Nieuw wachtwoord (optioneel)" type="password" placeholder="Laat leeg om niet te wijzigen" />}</editUserForm.AppField>
                <editUserForm.AppField name="role">{field => (
                  <div>
                    <Label htmlFor={field.name}>Rol</Label>
                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as "Admin" | "Employee")}>
                      <SelectTrigger><SelectValue placeholder="Selecteer rol" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive mt-1">{String(field.state.meta.errors[0])}</p>}
                  </div>
                )}</editUserForm.AppField>
              </div>
              <DialogFooter>
                <editUserForm.Subscribe selector={state => state.canSubmit}>{canSubmit => (
                  <Button type="submit" disabled={!canSubmit}>Opslaan</Button>
                )}</editUserForm.Subscribe>
              </DialogFooter>
            </form>
          </editUserForm.AppForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

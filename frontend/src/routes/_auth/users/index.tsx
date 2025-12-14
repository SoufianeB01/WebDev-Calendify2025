import { createFileRoute } from "@tanstack/react-router";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PencilIcon, PlusIcon, ShieldIcon, TrashIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import type { User } from "@/types/User";
import { createUserSchema, updateUserSchema } from "@/types/User";
import mockData from "@/data/mock.json";
import { useAppForm } from "@/hooks/use-app-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute('/_auth/users/')({
  component: RouteComponent,
});

function RouteComponent() {
  // Mock users data from JSON
  const [users, setUsers] = useState<Array<User>>(mockData.users as Array<User>);
  // const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const addUserForm = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      role: "Employee" as "Admin" | "Employee",
      password: "",
    },
    onSubmit: ({ value }) => {
      // TODO: Uncomment when backend endpoint is ready
      // addUserMutation.mutate(value, {
      //   onSuccess: (newUser) => {
      //     setUsers([...users, newUser]);
      //     setIsAddDialogOpen(false);
      //     addUserForm.reset();
      //     toast.success("Gebruiker succesvol aangemaakt");
      //   },
      //   onError: (error) => {
      //     console.error('Error creating user:', error);
      //     toast.error("Fout bij het aanmaken van gebruiker");
      //   },
      //   onSettled: () => {
      //     queryClient.invalidateQueries({ queryKey: ['users'] });
      //   },
      // });
      // return;

      // Mock add
      const newUser: User = {
        userId: Math.max(...users.map(u => u.userId)) + 1,
        firstName: value.firstName,
        lastName: value.lastName,
        username: value.username,
        email: value.email,
        role: value.role,
      };
      setUsers([...users, newUser]);
      toast.success("Gebruiker succesvol aangemaakt (demo)");

      setIsAddDialogOpen(false);
      addUserForm.reset();
    },
    validators: {
      onSubmit: createUserSchema,
    },
  });

  const editUserForm = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      role: "Employee" as "Admin" | "Employee",
      password: "" as string | undefined,
    },
    onSubmit: ({ value }) => {
      if (!selectedUser) return;

      // TODO: Uncomment when backend endpoint is ready
      // updateUserMutation.mutate({ userId: selectedUser.userId, data: value }, {
      //   onSuccess: (updated) => {
      //     setUsers(users.map(u => u.userId === selectedUser.userId ? updated : u));
      //     setIsEditDialogOpen(false);
      //     setSelectedUser(null);
      //     editUserForm.reset();
      //     toast.success("Gebruiker succesvol bijgewerkt");
      //   },
      //   onError: (error) => {
      //     console.error('Error updating user:', error);
      //     toast.error("Fout bij het bijwerken van gebruiker");
      //   },
      //   onSettled: () => {
      //     queryClient.invalidateQueries({ queryKey: ['users'] });
      //   },
      // });
      // return;

      // Mock update
      setUsers(users.map(u =>
        u.userId === selectedUser.userId ? { ...u, ...value } : u
      ));
      toast.success("Gebruiker succesvol bijgewerkt (demo)");

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editUserForm.reset();
    },
    validators: {
      onSubmit: updateUserSchema,
    },
  });

  // TanStack Query mutation for adding user
  // const addUserMutation = useMutation({
  //   mutationFn: async (data: Partial<User & { password?: string }>) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/admin/users`, {
  //       method: 'POST',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to create user');
  //     return response.json();
  //   },
  // });

  // TanStack Query mutation for updating user
  // const updateUserMutation = useMutation({
  //   mutationFn: async ({ userId, data }: { userId: number; data: Partial<User & { password?: string }> }) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
  //       method: 'PUT',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to update user');
  //     return response.json();
  //   },
  // });

  // TanStack Query mutation for deleting user
  // const deleteUserMutation = useMutation({
  //   mutationFn: async (userId: number) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
  //       method: 'DELETE',
  //       mode: 'cors',
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to delete user');
  //     return userId;
  //   },
  // });

  const handleDeleteUser = (userId: number) => {
    if (!confirm("Weet u zeker dat u deze gebruiker wilt verwijderen?")) return;

    // TODO: Uncomment when backend endpoint is ready
    // deleteUserMutation.mutate(userId, {
    //   onSuccess: (deletedUserId) => {
    //     setUsers(users.filter(u => u.userId !== deletedUserId));
    //     toast.success("Gebruiker succesvol verwijderd");
    //   },
    //   onError: (error) => {
    //     console.error('Error deleting user:', error);
    //     toast.error("Fout bij het verwijderen van gebruiker");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['users'] });
    //   },
    // });
    // return;

    // Mock delete
    setUsers(users.filter(u => u.userId !== userId));
    toast.success("Gebruiker succesvol verwijderd (demo)");
  };

  const getRoleBadge = (role: string) => {
    if (role === "Admin") {
      return (
        <Badge className="bg-purple-500">
          <ShieldIcon className="h-3 w-3 mr-1" /> Admin
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <UserIcon className="h-3 w-3 mr-1" /> Employee
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gebruikersbeheer</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nieuwe gebruiker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <addUserForm.AppForm>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addUserForm.handleSubmit();
                }}
                noValidate
              >
                <DialogHeader>
                  <DialogTitle>Nieuwe gebruiker aanmaken</DialogTitle>
                  <DialogDescription>Vul de gegevens in voor de nieuwe gebruiker</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <addUserForm.AppField
                    name="firstName"
                    children={(field) => (
                      <field.TextField label="Voornaam" type="text" />
                    )}
                  />
                  <addUserForm.AppField
                    name="lastName"
                    children={(field) => (
                      <field.TextField label="Achternaam" type="text" />
                    )}
                  />
                  <addUserForm.AppField
                    name="username"
                    children={(field) => (
                      <field.TextField label="Gebruikersnaam" type="text" />
                    )}
                  />
                  <addUserForm.AppField
                    name="email"
                    children={(field) => (
                      <field.TextField label="E-mail" type="text" />
                    )}
                  />
                  <addUserForm.AppField
                    name="password"
                    children={(field) => (
                      <field.TextField label="Wachtwoord" type="password" />
                    )}
                  />
                  <addUserForm.AppField
                    name="role"
                    children={(field) => (
                      <div>
                        <Label htmlFor={field.name}>Rol</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value as "Admin" | "Employee")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Employee">Employee</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive mt-1">
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
                <DialogFooter>
                  <addUserForm.Subscribe
                    selector={(state) => state.canSubmit}
                    children={(canSubmit) => (
                      <Button type="submit" disabled={!canSubmit}>
                        Aanmaken
                      </Button>
                    )}
                  />
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
            <p className="text-muted-foreground text-center py-8">
              Geen gebruikers gevonden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Gebruikersnaam</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {user.firstName} {user.lastName}
                      </div>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            editUserForm.setFieldValue("firstName", user.firstName);
                            editUserForm.setFieldValue("lastName", user.lastName);
                            editUserForm.setFieldValue("username", user.username);
                            editUserForm.setFieldValue("email", user.email);
                            editUserForm.setFieldValue("role", user.role);
                            editUserForm.setFieldValue("password", "");
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.userId)}
                        >
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <editUserForm.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editUserForm.handleSubmit();
              }}
              noValidate
            >
              <DialogHeader>
                <DialogTitle>Gebruiker bewerken</DialogTitle>
                <DialogDescription>Bewerk de gebruikersgegevens</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <editUserForm.AppField
                  name="firstName"
                  children={(field) => (
                    <field.TextField label="Voornaam" type="text" />
                  )}
                />
                <editUserForm.AppField
                  name="lastName"
                  children={(field) => (
                    <field.TextField label="Achternaam" type="text" />
                  )}
                />
                <editUserForm.AppField
                  name="username"
                  children={(field) => (
                    <field.TextField label="Gebruikersnaam" type="text" />
                  )}
                />
                <editUserForm.AppField
                  name="email"
                  children={(field) => (
                    <field.TextField label="E-mail" type="text" />
                  )}
                />
                <editUserForm.AppField
                  name="password"
                  children={(field) => (
                    <field.TextField label="Nieuw wachtwoord (optioneel)" type="password" placeholder="Laat leeg om niet te wijzigen" />
                  )}
                />
                <editUserForm.AppField
                  name="role"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name}>Rol</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as "Admin" | "Employee")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employee">Employee</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive mt-1">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              <DialogFooter>
                <editUserForm.Subscribe
                  selector={(state) => state.canSubmit}
                  children={(canSubmit) => (
                    <Button type="submit" disabled={!canSubmit}>
                      Opslaan
                    </Button>
                  )}
                />
              </DialogFooter>
            </form>
          </editUserForm.AppForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

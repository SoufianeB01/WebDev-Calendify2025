import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { CalendarEvent } from "@/components/event-calendar";
import type { Event } from "@/types/Event";
import type { User } from "@/types/User";
import { EventCalendar } from "@/components/event-calendar";
import { createEventSchema } from "@/types/Event";
import { createUserSchema, updateUserSchema } from "@/types/User";
import { useAppForm } from "@/hooks/use-app-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_auth/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  // State for events
  const [events, setEvents] = useState<Array<Event>>([]);
  const [calendarEvents, setCalendarEvents] = useState<Array<CalendarEvent>>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);

  // State for users
  const [users, setUsers] = useState<Array<User>>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5143";

  // Fetch events
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/api/events`, {
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Kon events niet laden");
        return;
      }
      const data: Array<Event> = await res.json();
      setEvents(data);

      // Convert to CalendarEvent format
      const converted: Array<CalendarEvent> = data.map(event => ({
        id: event.eventId.toString(),
        title: event.title,
        description: event.description,
        start: new Date(event.eventDate + 'T' + event.startTime),
        end: new Date(event.eventDate + 'T' + event.endTime),
        allDay: false,
        color: 'sky' as const,
      }));
      setCalendarEvents(converted);
    };
    load();
  }, []);

  // Fetch users
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

  // Event forms
  const addEventForm = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
    },
    onSubmit: async ({ value }) => {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (!res.ok) {
        toast.error("Aanmaken mislukt");
        return;
      }
      const created: Event = await res.json();
      setEvents((e) => [...e, created]);

      // Add to calendar events
      const calEvent: CalendarEvent = {
        id: created.eventId.toString(),
        title: created.title,
        description: created.description,
        start: new Date(created.eventDate + 'T' + created.startTime),
        end: new Date(created.eventDate + 'T' + created.endTime),
        allDay: false,
        color: 'sky',
      };
      setCalendarEvents((e) => [...e, calEvent]);

      setIsAddEventOpen(false);
      addEventForm.reset();
      toast.success("Evenement aangemaakt");
    },
    validators: { onSubmit: createEventSchema },
  });

  const editEventForm = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
    },
    onSubmit: async ({ value }) => {
      if (!selectedEvent) return;
      const res = await fetch(
        `${API_BASE}/api/events/${selectedEvent.eventId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        }
      );
      if (!res.ok) {
        toast.error("Bijwerken mislukt");
        return;
      }
      const updated: Event = await res.json();
      setEvents((e) =>
        e.map((x) => (x.eventId === updated.eventId ? updated : x))
      );

      // Update calendar events
      const calEvent: CalendarEvent = {
        id: updated.eventId.toString(),
        title: updated.title,
        description: updated.description,
        start: new Date(updated.eventDate + 'T' + updated.startTime),
        end: new Date(updated.eventDate + 'T' + updated.endTime),
        allDay: false,
        color: 'sky',
      };
      setCalendarEvents((e) =>
        e.map((x) => (x.id === calEvent.id ? calEvent : x))
      );

      setIsEditEventOpen(false);
      setSelectedEvent(null);
      toast.success("Evenement bijgewerkt");
    },
    validators: { onSubmit: createEventSchema },
  });

  const deleteEvent = async (id: string) => {
    if (!confirm("Weet u zeker dat u dit evenement wilt verwijderen?")) return;

    const res = await fetch(`${API_BASE}/api/events/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      toast.error("Verwijderen mislukt");
      return;
    }
    setEvents((e) => e.filter((x) => x.eventId !== id));
    setCalendarEvents((e) => e.filter((x) => x.id !== id));
    setIsEditEventOpen(false);
    setSelectedEvent(null);
    toast.success("Evenement verwijderd");
  };

  const handleEventClick = (calEvent: CalendarEvent) => {
    // Find the corresponding Event from backend data
    const event = events.find(e => e.eventId === calEvent.id);
    if (!event) return;

    setSelectedEvent(event);
    editEventForm.setFieldValue("title", event.title);
    editEventForm.setFieldValue("description", event.description);
    editEventForm.setFieldValue("eventDate", event.eventDate);
    editEventForm.setFieldValue("startTime", event.startTime);
    editEventForm.setFieldValue("endTime", event.endTime);
    editEventForm.setFieldValue("location", event.location);
    setIsEditEventOpen(true);
  };

  // User forms
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
        setIsAddUserOpen(false);
        addUserForm.reset();
      } catch {
        toast.error("Gebruiker aanmaken mislukt");
      }
    }
  });

  const editUserForm = useAppForm({
    defaultValues: { name: "", email: "", role: "Employee" as "Admin" | "Employee", password: undefined as string | undefined },
    // @ts-expect-error - Zod validator schema validation mismatch with optional password
    validators: { onSubmit: updateUserSchema },
    onSubmit: async ({ value }) => {
      if (!selectedUser) return;
      const body: any = { ...value };
      if (!body.password || body.password === "") delete body.password;

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
        setIsEditUserOpen(false);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground">Beheer evenementen en gebruikers</p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <div className="flex justify-end mb-4">
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 size-4" />
                  Nieuw evenement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <addEventForm.AppForm>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addEventForm.handleSubmit();
                    }}
                    noValidate
                  >
                    <DialogHeader>
                      <DialogTitle>Nieuw evenement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <addEventForm.AppField
                        name="title"
                        children={(f) => <f.TextField label="Titel" />}
                      />
                      <addEventForm.AppField
                        name="description"
                        children={(f) => <f.TextArea label="Beschrijving" />}
                      />
                      <addEventForm.AppField
                        name="eventDate"
                        children={(f) => <f.TextField type="date" label="Datum" />}
                      />
                      <addEventForm.AppField
                        name="startTime"
                        children={(f) => <f.TextField type="time" label="Starttijd" />}
                      />
                      <addEventForm.AppField
                        name="endTime"
                        children={(f) => <f.TextField type="time" label="Eindtijd" />}
                      />
                      <addEventForm.AppField
                        name="location"
                        children={(f) => <f.TextField label="Locatie" />}
                      />
                    </div>
                    <DialogFooter>
                      <addEventForm.Subscribe selector={(state) => state.canSubmit}>
                        {(canSubmit) => (
                          <Button type="submit" disabled={!canSubmit}>Opslaan</Button>
                        )}
                      </addEventForm.Subscribe>
                    </DialogFooter>
                  </form>
                </addEventForm.AppForm>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="mt-7">
              <EventCalendar
                events={calendarEvents}
                onEventSelect={handleEventClick}
              />
            </CardContent>
          </Card>

          {/* Edit Event Dialog with enhanced view */}
          <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Evenement details</DialogTitle>
              </DialogHeader>

              {selectedEvent && (
                <div className="space-y-6">
                  {/* Event Info Display */}
                  <div className="space-y-4 pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                      <p className="text-muted-foreground mt-2">{selectedEvent.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(selectedEvent.eventDate).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm col-span-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <editEventForm.AppForm>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        editEventForm.handleSubmit();
                      }}
                      noValidate
                      className="space-y-4"
                    >
                      <h4 className="font-semibold">Evenement bewerken</h4>
                      <div className="grid gap-4">
                        <editEventForm.AppField name="title">
                          {(field) => <field.TextField label="Titel" />}
                        </editEventForm.AppField>
                        <editEventForm.AppField name="description">
                          {(field) => <field.TextArea label="Beschrijving" />}
                        </editEventForm.AppField>
                        <div className="grid grid-cols-2 gap-4">
                          <editEventForm.AppField name="eventDate">
                            {(field) => <field.TextField label="Datum" type="date" />}
                          </editEventForm.AppField>
                          <editEventForm.AppField name="location">
                            {(field) => <field.TextField label="Locatie" />}
                          </editEventForm.AppField>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <editEventForm.AppField name="startTime">
                            {(field) => <field.TextField label="Starttijd" type="time" />}
                          </editEventForm.AppField>
                          <editEventForm.AppField name="endTime">
                            {(field) => <field.TextField label="Eindtijd" type="time" />}
                          </editEventForm.AppField>
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => deleteEvent(selectedEvent.eventId)}
                        >
                          <TrashIcon className="mr-2 size-4" />
                          Verwijderen
                        </Button>
                        <editEventForm.Subscribe selector={(state) => state.canSubmit}>
                          {(canSubmit) => (
                            <Button type="submit" disabled={!canSubmit}>
                              <PencilIcon className="mr-2 size-4" />
                              Opslaan
                            </Button>
                          )}
                        </editEventForm.Subscribe>
                      </DialogFooter>
                    </form>
                  </editEventForm.AppForm>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gebruikersoverzicht</CardTitle>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
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
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <addUserForm.AppField name="name">{field => <field.TextField label="Naam" type="text" />}</addUserForm.AppField>
                        <addUserForm.AppField name="email">{field => <field.TextField label="E-mail" type="email" />}</addUserForm.AppField>
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
                        <addUserForm.Subscribe selector={(state) => state.canSubmit}>
                          {(canSubmit) => (
                            <Button type="submit" disabled={!canSubmit}>Opslaan</Button>
                          )}
                        </addUserForm.Subscribe>
                      </DialogFooter>
                    </form>
                  </addUserForm.AppForm>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
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
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              editUserForm.setFieldValue("name", user.name);
                              editUserForm.setFieldValue("email", user.email);
                              editUserForm.setFieldValue("role", user.role);
                              editUserForm.setFieldValue("password", undefined);
                              setIsEditUserOpen(true);
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
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent>
              <editUserForm.AppForm>
                <form onSubmit={e => { e.preventDefault(); editUserForm.handleSubmit(); }} noValidate>
                  <DialogHeader>
                    <DialogTitle>Gebruiker bewerken</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <editUserForm.AppField name="name">{field => <field.TextField label="Naam" type="text" />}</editUserForm.AppField>
                    <editUserForm.AppField name="email">{field => <field.TextField label="E-mail" type="email" />}</editUserForm.AppField>
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
                    <editUserForm.Subscribe selector={(state) => state.canSubmit}>
                      {(canSubmit) => (
                        <Button type="submit" disabled={!canSubmit}>Opslaan</Button>
                      )}
                    </editUserForm.Subscribe>
                  </DialogFooter>
                </form>
              </editUserForm.AppForm>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

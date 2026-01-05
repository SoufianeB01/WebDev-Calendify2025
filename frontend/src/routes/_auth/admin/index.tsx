import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  // State for dialogs
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5143";

  // Fetch events with useQuery
  const { data: events = [] } = useQuery<Array<Event>>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/events`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  // Convert events to calendar format
  const calendarEvents: Array<CalendarEvent> = events.map(event => ({
    id: event.eventId.toString(),
    title: event.title,
    description: event.description,
    start: new Date(event.eventDate + 'T' + event.startTime),
    end: new Date(event.eventDate + 'T' + event.endTime),
    allDay: false,
    color: 'sky' as const,
  }));

  // Fetch users with useQuery
  const { data: users = [] } = useQuery<Array<User>>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/employees`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    },
  });

  // Mutations for events
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Evenement aangemaakt");
      setIsAddEventOpen(false);
      addEventForm.reset();
    },
    onError: () => {
      toast.error("Aanmaken mislukt");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: any }) => {
      const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Evenement bijgewerkt");
      setIsEditEventOpen(false);
      setSelectedEvent(null);
    },
    onError: () => {
      toast.error("Bijwerken mislukt");
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Evenement verwijderd");
      setIsEditEventOpen(false);
      setSelectedEvent(null);
    },
    onError: () => {
      toast.error("Verwijderen mislukt");
    },
  });

  // Mutations for users
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/api/employees`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create employee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Gebruiker succesvol aangemaakt");
      setIsAddUserOpen(false);
      addUserForm.reset();
    },
    onError: () => {
      toast.error("Gebruiker aanmaken mislukt");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const body: any = { ...data };
      if (!body.password || body.password === "") delete body.password;

      const res = await fetch(`${API_BASE}/api/employees/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update employee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Gebruiker succesvol bijgewerkt");
      setIsEditUserOpen(false);
      setSelectedUser(null);
      editUserForm.reset();
    },
    onError: () => {
      toast.error("Gebruiker bijwerken mislukt");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`${API_BASE}/api/employees/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete employee");
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Gebruiker succesvol verwijderd");
    },
    onError: () => {
      toast.error("Gebruiker verwijderen mislukt");
    },
  });

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
    onSubmit: ({ value }) => {
      createEventMutation.mutate(value);
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
    onSubmit: ({ value }) => {
      if (!selectedEvent) return;
      updateEventMutation.mutate({ eventId: selectedEvent.eventId, data: value });
    },
    validators: { onSubmit: createEventSchema },
  });

  const handleEventClick = (calEvent: CalendarEvent) => {
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
    onSubmit: ({ value }) => {
      createUserMutation.mutate(value);
    }
  });

  const editUserForm = useAppForm({
    defaultValues: { name: "", email: "", role: "Employee" as "Admin" | "Employee", password: undefined as string | undefined },
    // @ts-expect-error - Zod validator schema validation mismatch with optional password
    validators: { onSubmit: updateUserSchema },
    onSubmit: ({ value }) => {
      if (!selectedUser) return;
      updateUserMutation.mutate({ userId: selectedUser.userId, data: value });
    }
  });

  const getRoleBadge = (role: string) =>
    role === "Admin" ? (
      <Badge variant="default" className="bg-purple-600 hover:bg-purple-700"><ShieldIcon className="h-3 w-3 mr-1" /> Admin</Badge>
    ) : (
      <Badge variant="secondary"><UserIcon className="h-3 w-3 mr-1" /> Employee</Badge>
    );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="text-muted-foreground">Beheer evenementen en gebruikers</p>
        </div>

        {activeTab === "calendar" && (
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
                    <addEventForm.AppField name="eventDate">
                      {(field) => <field.TextField label="Datum" type="date" />}
                    </addEventForm.AppField>
                    <div className="grid grid-cols-2 gap-4">
                      <addEventForm.AppField name="startTime">
                        {(field) => <field.TextField label="Starttijd" type="time" />}
                      </addEventForm.AppField>
                      <addEventForm.AppField name="endTime">
                        {(field) => <field.TextField label="Eindtijd" type="time" />}
                      </addEventForm.AppField>
                    </div>
                    <addEventForm.AppField name="location">
                      {(field) => <field.TextField label="Locatie" />}
                    </addEventForm.AppField>
                  </div>
                  <DialogFooter>
                    <addEventForm.Subscribe selector={(state) => state.canSubmit}>
                      {(canSubmit) => (
                        <Button type="submit" disabled={!canSubmit}>
                          <PlusIcon className="mr-2 size-4" />
                          Aanmaken
                        </Button>
                      )}
                    </addEventForm.Subscribe>
                  </DialogFooter>
                </form>
              </addEventForm.AppForm>
            </DialogContent>
          </Dialog>
        )}

        {activeTab === "users" && (
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
                    <addUserForm.AppField name="email">{field => <field.TextField label="E-mail" type="text" />}</addUserForm.AppField>
                    <addUserForm.AppField name="password">{field => <field.TextField label="Wachtwoord" type="password" />}</addUserForm.AppField>
                    <addUserForm.AppField name="role">{field => (
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={field.name}>Rol</Label>
                        <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as "Admin" | "Employee")}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Employee">Employee</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
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
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-secondary text-primary grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
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
                          onClick={() => {
                            if (confirm("Weet u zeker dat u dit evenement wilt verwijderen?")) {
                              deleteEventMutation.mutate(selectedEvent.eventId);
                            }
                          }}
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
            <CardHeader>
              <CardTitle>Gebruikersoverzicht</CardTitle>
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
                            onClick={() => {
                              if (confirm("Weet u zeker dat u deze gebruiker wilt verwijderen?")) {
                                deleteUserMutation.mutate(user.userId);
                              }
                            }}
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

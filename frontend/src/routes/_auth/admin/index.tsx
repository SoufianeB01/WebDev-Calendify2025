import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/types/Event";
import { createEventSchema } from "@/types/Event";
import { useAppForm } from "@/hooks/use-app-form";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_auth/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [events, setEvents] = useState<Array<Event>>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5143";
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/api/events`, {
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Kon events niet laden");
        return;
      }
      setEvents(await res.json());
    };
    load();
  }, []);

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
      const created = await res.json();
      setEvents((e) => [...e, created]);
      setIsAddOpen(false);
      addEventForm.reset();
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
      const updated = await res.json();
      setEvents((e) =>
        e.map((x) => (x.eventId === updated.eventId ? updated : x))
      );
      setIsEditOpen(false);
      setSelectedEvent(null);
    },
    validators: { onSubmit: createEventSchema },
  });

  const deleteEvent = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/events/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      toast.error("Verwijderen mislukt");
      return;
    }
    setEvents((e) => e.filter((x) => x.eventId !== id));
  };

  const openEditDialog = (e: Event) => {
    setSelectedEvent(e);
    editEventForm.setFieldValue("title", e.title);
    editEventForm.setFieldValue("description", e.description);
    editEventForm.setFieldValue("eventDate", e.eventDate);
    editEventForm.setFieldValue("startTime", e.startTime);
    editEventForm.setFieldValue("endTime", e.endTime);
    editEventForm.setFieldValue("location", e.location);
    setIsEditOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="text-muted-foreground">Beheer alle evenementen</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Nieuw evenement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <addEventForm.AppForm>
              <form onSubmit={addEventForm.handleSubmit}>
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
                  <Button type="submit">Opslaan</Button>
                </DialogFooter>
              </form>
            </addEventForm.AppForm>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evenementen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Tijd</TableHead>
                <TableHead>Locatie</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.eventId}>
                  <TableCell>{e.title}</TableCell>
                  <TableCell>
                    <CalendarIcon className="inline mr-2 size-4" />
                    {new Date(e.eventDate).toLocaleDateString("nl-NL")}
                  </TableCell>
                  <TableCell>
                    <ClockIcon className="inline mr-2 size-4" />
                    {e.startTime} - {e.endTime}
                  </TableCell>
                  <TableCell>
                    <MapPinIcon className="inline mr-2 size-4" />
                    {e.location}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(e)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteEvent(e.eventId)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

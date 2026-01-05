import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { CalendarIcon, DoorOpenIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import type { Room } from "@/types/Room";
import { useAuth } from "@/lib/auth";
import { simpleRoomSchema } from "@/types/Room";
import { createRoomBookingSchema } from "@/types/RoomBooking";
import { useAppForm } from "@/hooks/use-app-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute('/_auth/rooms/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';

  const { data: rooms = [] } = useQuery<Array<Room>>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/rooms`, { credentials: 'include' });
      if (!res.ok) throw new Error('Kon kamers niet ophalen');
      return res.json();
    }
  });

  const { data: allBookings = [] } = useQuery<Array<any>>({
    queryKey: ['allRoomBookings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/RoomBooking`, { credentials: 'include' });
      if (!res.ok) throw new Error('Kon boekingen niet ophalen');
      return res.json();
    }
  });

  const { isAdmin } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);

  // Mutations
  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Kon kamer niet aanmaken');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Kamer succesvol aangemaakt');
      setIsAddDialogOpen(false);
      addRoomForm.reset();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij het aanmaken van kamer');
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ roomId, data }: { roomId: string; data: any }) => {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Kon kamer niet bijwerken');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Kamer succesvol bijgewerkt');
      setIsEditDialogOpen(false);
      setSelectedRoom(null);
      editRoomForm.reset();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij het bijwerken van kamer');
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Kon kamer niet verwijderen');
      return roomId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Kamer succesvol verwijderd');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij het verwijderen van kamer');
    },
  });

  const bookRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/api/RoomBooking`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Kon kamer niet boeken');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allRoomBookings'] });
      toast.success('Kamer succesvol geboekt');
      setIsBookDialogOpen(false);
      setSelectedRoom(null);
      bookRoomForm.reset();
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error(error.message || 'Fout bij het boeken van kamer');
    },
  });

  // Forms
  const addRoomForm = useAppForm({
    defaultValues: {
      roomName: "",
      capacity: 0,
      location: "",
    },
    onSubmit: ({ value }) => {
      createRoomMutation.mutate(value);
    },
    validators: {
      onSubmit: simpleRoomSchema,
    },
  });

  const editRoomForm = useAppForm({
    defaultValues: {
      roomName: "",
      capacity: 0,
      location: "",
    },
    onSubmit: ({ value }) => {
      if (!selectedRoom) return;
      updateRoomMutation.mutate({ roomId: selectedRoom.roomId, data: value });
    },
    validators: {
      onSubmit: simpleRoomSchema,
    },
  });

  const bookRoomForm = useAppForm({
    defaultValues: {
      roomId: "",
      bookingDate: "",
      startTime: "",
      endTime: "",
      purpose: "",
    },
    onSubmit: ({ value }) => {
      if (!selectedRoom) return;
      bookRoomMutation.mutate({ ...value, roomId: selectedRoom.roomId });
    },
    validators: {
      onSubmit: createRoomBookingSchema,
    },
  });

  const RoomCard = ({ room }: { room: Room }) => {
    const roomBookings = allBookings.filter((b: any) => b.roomId === room.roomId);
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = roomBookings
      .filter((b: any) => b.bookingDate.split('T')[0] === today)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <DoorOpenIcon className="h-5 w-5" />
              {room.roomName}
            </CardTitle>
            <Badge variant="secondary">{room.capacity} personen</Badge>
          </div>
          <CardDescription className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            {room.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <UsersIcon className="h-4 w-4" />
            <span>Capaciteit: {room.capacity} personen</span>
          </div>
          {todayBookings.length > 0 && (
            <div className="bg-secondary mt-2 p-2 bg-muted rounded-md">
              <p className="text-xs font-semibold mb-1">Vandaag geboekt:</p>
              <div className="space-y-1">
                {todayBookings.map((booking: any, idx: number) => (
                  <div key={idx} className="text-xs">
                    {booking.startTime} - {booking.endTime}
                    {booking.purpose && ` |  ${booking.purpose}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => {
              setSelectedRoom(room);
              bookRoomForm.setFieldValue("roomId", room.roomId);
              bookRoomForm.setFieldValue("bookingDate", "");
              bookRoomForm.setFieldValue("startTime", "");
              bookRoomForm.setFieldValue("endTime", "");
              bookRoomForm.setFieldValue("purpose", "");
              setIsBookDialogOpen(true);
            }}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Boeken
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRoom(room);
            }}
          >
            Details
          </Button>

          {isAdmin && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedRoom(room);
                  editRoomForm.setFieldValue("roomName", room.roomName);
                  editRoomForm.setFieldValue("capacity", room.capacity);
                  editRoomForm.setFieldValue("location", room.location);
                  setIsEditDialogOpen(true);
                }}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("Weet u zeker dat u deze kamer wilt verwijderen?")) {
                    deleteRoomMutation.mutate(room.roomId);
                  }
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kamers en vergaderruimtes</h1>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nieuwe kamer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <addRoomForm.AppForm>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addRoomForm.handleSubmit();
                  }}
                  noValidate
                >
                  <DialogHeader>
                    <DialogTitle>Nieuwe kamer aanmaken</DialogTitle>
                    <DialogDescription>Vul de gegevens in voor de nieuwe kamer</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <addRoomForm.AppField
                      name="roomName"
                      children={(field) => (
                        <field.TextField label="Kamernaam" type="text" />
                      )}
                    />
                    <addRoomForm.AppField
                      name="capacity"
                      children={(field) => (
                        <field.TextField label="Capaciteit" type="number" />
                      )}
                    />
                    <addRoomForm.AppField
                      name="location"
                      children={(field) => (
                        <field.TextField label="Locatie" type="text" />
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <addRoomForm.Subscribe
                      selector={(state) => state.canSubmit}
                      children={(canSubmit) => (
                        <Button type="submit" disabled={!canSubmit}>
                          Aanmaken
                        </Button>
                      )}
                    />
                  </DialogFooter>
                </form>
              </addRoomForm.AppForm>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            Geen kamers beschikbaar
          </p>
        ) : (
          rooms.map((room) => <RoomCard key={room.roomId} room={room} />)
        )}
      </div>

      {/* Upcoming Bookings Section */}
      {allBookings.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Aankomende boekingen</CardTitle>
              <CardDescription>Overzicht van toekomstige kamerboekingen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allBookings
                  .filter((booking: any) => {
                    // Parse the booking date and time
                    const bookingDate = booking.bookingDate.split('T')[0];
                    const bookingDateTime = new Date(bookingDate + 'T' + booking.endTime);
                    const now = new Date();
                    // Show bookings that haven't ended yet
                    return bookingDateTime > now;
                  })
                  .sort((a: any, b: any) => {
                    const dateA = new Date(a.bookingDate.split('T')[0] + 'T' + a.startTime);
                    const dateB = new Date(b.bookingDate.split('T')[0] + 'T' + b.startTime);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map((booking: any, idx: number) => {
                    const room = rooms.find((r) => r.roomId === booking.roomId);
                    const bookingDate = new Date(booking.bookingDate.split('T')[0]).toLocaleDateString('nl-NL');
                    return (
                      <div key={idx} className="bg-secondary flex items-center justify-between p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-semibold">{room?.roomName || 'Onbekende kamer'}</p>
                          <p className="text-sm">
                            {bookingDate} | {booking.startTime} - {booking.endTime}
                          </p>
                          {booking.purpose && (
                            <p className="text-sm">{booking.purpose}</p>
                          )}
                        </div>
                        <Badge variant="default">{room?.location}</Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <editRoomForm.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editRoomForm.handleSubmit();
              }}
              noValidate
            >
              <DialogHeader>
                <DialogTitle>Kamer bewerken</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <editRoomForm.AppField
                  name="roomName"
                  children={(field) => (
                    <field.TextField label="Kamernaam" type="text" />
                  )}
                />
                <editRoomForm.AppField
                  name="capacity"
                  children={(field) => (
                    <field.TextField label="Capaciteit" type="number" />
                  )}
                />
                <editRoomForm.AppField
                  name="location"
                  children={(field) => (
                    <field.TextField label="Locatie" type="text" />
                  )}
                />
              </div>
              <DialogFooter>
                <editRoomForm.Subscribe
                  selector={(state) => state.canSubmit}
                  children={(canSubmit) => (
                    <Button type="submit" disabled={!canSubmit}>
                      Opslaan
                    </Button>
                  )}
                />
              </DialogFooter>
            </form>
          </editRoomForm.AppForm>
        </DialogContent>
      </Dialog>

      {/* Book Dialog */}
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent>
          <bookRoomForm.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                bookRoomForm.handleSubmit();
              }}
              noValidate
            >
              <DialogHeader>
                <DialogTitle>Kamer boeken: {selectedRoom?.roomName}</DialogTitle>
                <DialogDescription>Vul de boeking gegevens in</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <bookRoomForm.AppField
                  name="bookingDate"
                  children={(field) => (
                    <field.TextField label="Datum" type="date" />
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <bookRoomForm.AppField
                    name="startTime"
                    children={(field) => (
                      <field.TextField label="Starttijd" type="time" />
                    )}
                  />
                  <bookRoomForm.AppField
                    name="endTime"
                    children={(field) => (
                      <field.TextField label="Eindtijd" type="time" />
                    )}
                  />
                </div>
                <bookRoomForm.AppField
                  name="purpose"
                  children={(field) => (
                    <field.TextField label="Doel" type="text" placeholder="Bijv. Teammeeting, Client presentatie..." />
                  )}
                />
              </div>
              <DialogFooter>
                <bookRoomForm.Subscribe
                  selector={(state) => state.canSubmit}
                  children={(canSubmit) => (
                    <Button type="submit" disabled={!canSubmit}>
                      Boeken
                    </Button>
                  )}
                />
              </DialogFooter>
            </form>
          </bookRoomForm.AppForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

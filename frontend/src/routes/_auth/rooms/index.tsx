import { createFileRoute } from '@tanstack/react-router';
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarIcon, DoorOpenIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import type { Room } from "@/types/Room";
import { simpleRoomSchema } from "@/types/Room";
import { createRoomBookingSchema } from "@/types/RoomBooking";
import mockData from "@/data/mock.json";
import { useAppForm } from "@/hooks/use-app-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute('/_auth/rooms/')({
  component: RouteComponent,
});

function RouteComponent() {
  // Mock rooms data from JSON
  const [rooms, setRooms] = useState<Array<Room>>(mockData.rooms);
  // const queryClient = useQueryClient();

  const [isAdmin] = useState(true); // Mock admin status
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const addRoomForm = useAppForm({
    defaultValues: {
      roomName: "",
      capacity: 0,
      location: "",
    },
    onSubmit: ({ value }) => {
      // TODO: Uncomment when backend endpoint is ready
      // addRoomMutation.mutate(value, {
      //   onSuccess: (newRoom) => {
      //     setRooms([...rooms, newRoom]);
      //     setIsAddDialogOpen(false);
      //     addRoomForm.reset();
      //     toast.success("Kamer succesvol aangemaakt");
      //   },
      //   onError: (error) => {
      //     console.error('Error creating room:', error);
      //     toast.error("Fout bij het aanmaken van kamer");
      //   },
      //   onSettled: () => {
      //     queryClient.invalidateQueries({ queryKey: ['rooms'] });
      //   },
      // });
      // return;

      // Mock add
      const newRoom: Room = {
        ...value,
        roomId: Math.max(...rooms.map(r => r.roomId)) + 1,
        services: [],
        isOnline: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRooms([...rooms, newRoom]);
      toast.success("Kamer succesvol aangemaakt (demo)");

      setIsAddDialogOpen(false);
      addRoomForm.reset();
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

      // TODO: Uncomment when backend endpoint is ready
      // updateRoomMutation.mutate({ roomId: selectedRoom.roomId, data: value }, {
      //   onSuccess: (updated) => {
      //     setRooms(rooms.map(r => r.roomId === selectedRoom.roomId ? updated : r));
      //     setIsEditDialogOpen(false);
      //     setSelectedRoom(null);
      //     editRoomForm.reset();
      //     toast.success("Kamer succesvol bijgewerkt");
      //   },
      //   onError: (error) => {
      //     console.error('Error updating room:', error);
      //     toast.error("Fout bij het bijwerken van kamer");
      //   },
      //   onSettled: () => {
      //     queryClient.invalidateQueries({ queryKey: ['rooms'] });
      //   },
      // });
      // return;

      // Mock update
      setRooms(rooms.map(r =>
        r.roomId === selectedRoom.roomId ? { ...r, ...value, updatedAt: new Date().toISOString() } : r
      ));
      toast.success("Kamer succesvol bijgewerkt (demo)");

      setIsEditDialogOpen(false);
      setSelectedRoom(null);
      editRoomForm.reset();
    },
    validators: {
      onSubmit: simpleRoomSchema,
    },
  });

  const bookRoomForm = useAppForm({
    defaultValues: {
      roomId: 0,
      bookingDate: "",
      startTime: "",
      endTime: "",
      purpose: "",
    },
    onSubmit: ({ value: _value }) => {
      if (!selectedRoom) return;

      // TODO: Uncomment when backend endpoint is ready
      // bookRoomMutation.mutate({ ..._value, roomId: selectedRoom.roomId }, {
      //   onSuccess: () => {
      //     setIsBookDialogOpen(false);
      //     setSelectedRoom(null);
      //     bookRoomForm.reset();
      //     toast.success("Kamer succesvol geboekt");
      //   },
      //   onError: (error) => {
      //     console.error('Error booking room:', error);
      //     toast.error("Fout bij het boeken van kamer");
      //   },
      //   onSettled: () => {
      //     queryClient.invalidateQueries({ queryKey: ['roomBookings'] });
      //   },
      // });
      // return;

      // Mock booking
      toast.success("Kamer succesvol geboekt (demo)");

      setIsBookDialogOpen(false);
      setSelectedRoom(null);
      bookRoomForm.reset();
    },
    validators: {
      onSubmit: createRoomBookingSchema,
    },
  });


  // const addRoomMutation = useMutation({
  //   mutationFn: async (data: Partial<Room>) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/rooms`, {
  //       method: 'POST',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to create room');
  //     return response.json();
  //   },
  // });

  // const updateRoomMutation = useMutation({
  //   mutationFn: async ({ roomId, data }: { roomId: number; data: Partial<Room> }) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
  //       method: 'PUT',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to update room');
  //     return response.json();
  //   },
  // });

  // const deleteRoomMutation = useMutation({
  //   mutationFn: async (roomId: number) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
  //       method: 'DELETE',
  //       mode: 'cors',
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to delete room');
  //     return roomId;
  //   },
  // });

  // const bookRoomMutation = useMutation({
  //   mutationFn: async (data: Partial<RoomBooking> & { roomId: number }) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/roombooking`, {
  //       method: 'POST',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to book room');
  //     return response.json();
  //   },
  // });

  const handleDeleteRoom = (roomId: number) => {
    if (!confirm("Weet u zeker dat u deze kamer wilt verwijderen?")) return;

    // TODO: Uncomment when backend endpoint is ready
    // deleteRoomMutation.mutate(roomId, {
    //   onSuccess: (deletedRoomId) => {
    //     setRooms(rooms.filter(r => r.roomId !== deletedRoomId));
    //     toast.success("Kamer succesvol verwijderd");
    //   },
    //   onError: (error) => {
    //     console.error('Error deleting room:', error);
    //     toast.error("Fout bij het verwijderen van kamer");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['rooms'] });
    //   },
    // });
    // return;

    // Mock delete
    setRooms(rooms.filter(r => r.roomId !== roomId));
    toast.success("Kamer succesvol verwijderd (demo)");
  };

  const RoomCard = ({ room }: { room: Room }) => (
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="h-4 w-4" />
          <span>Capaciteit: {room.capacity} personen</span>
        </div>
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
            setIsViewDialogOpen(true);
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
              onClick={() => handleDeleteRoom(room.roomId)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );

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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoom?.roomName}</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Capaciteit: {selectedRoom.capacity} personen</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Locatie: {selectedRoom.location}</span>
                </div>
              </div>
            </div>
          )}
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

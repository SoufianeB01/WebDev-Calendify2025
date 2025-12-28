import { createFileRoute } from '@tanstack/react-router';
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarIcon, CheckCircleIcon, ClockIcon, PieChartIcon, PlusIcon, TrashIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import type { OfficeAttendance } from "@/types/OfficeAttendance";
import { createAttendanceSchema } from "@/types/OfficeAttendance";
import mockData from "@/data/mock.json";
import { useAppForm } from "@/hooks/use-app-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendancePieChart } from "@/components/charts/AttendancePieChart";

export const Route = createFileRoute('/_auth/office-attendance/')({
  component: RouteComponent,
});

function RouteComponent() {
  // Mock attendance data from JSON
  const [attendances, setAttendances] = useState<Array<OfficeAttendance>>(mockData.officeAttendance as Array<OfficeAttendance>);
  // const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const addAttendanceForm = useAppForm({
    defaultValues: {
      date: "",
      status: "Present" as "Present" | "Absent" | "Remote" | "Late",

    },
    onSubmit: ({ value }) => {
      // TODO: Uncomment when backend endpoint is ready
      // addAttendanceMutation.mutate(value, {
      //   onSuccess: (newAttendance) => {
      //     setAttendances([...attendances, newAttendance].sort((a, b) =>
      //       new Date(b.date).getTime() - new Date(a.date).getTime()
      //     ));
      //     setIsAddDialogOpen(false);
      //     addAttendanceForm.reset();
      //     toast.success("Aanwezigheid succesvol geregistreerd");
      //   },
      //   onError: (error) => {
      //     console.error('Error adding attendance:', error);
      //     toast.error("Fout bij het registreren van aanwezigheid");
      //   },
      //   onSettled: () => {
      //     queryClient.invalidateQueries({ queryKey: ['attendance'] });
      //   },
      // });
      // return;

      // Mock add
      const newAttendance: OfficeAttendance = {
        ...value,
        attendanceId: Math.max(...attendances.map(a => a.attendanceId), 0) + 1,
        userId: 1, // Mock current user ID
        createdAt: new Date().toISOString(),
      };
      setAttendances([...attendances, newAttendance].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      toast.success("Aanwezigheid succesvol geregistreerd (demo)");

      setIsAddDialogOpen(false);
      addAttendanceForm.reset();
    },
    validators: {
      onSubmit: createAttendanceSchema,
    },
  });

  // const addAttendanceMutation = useMutation({
  //   mutationFn: async (data: Partial<OfficeAttendance>) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/attendance`, {
  //       method: 'POST',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to add attendance');
  //     return response.json();
  //   },
  // });

  // const deleteAttendanceMutation = useMutation({
  //   mutationFn: async (attendanceId: number) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/attendance/${attendanceId}`, {
  //       method: 'DELETE',
  //       mode: 'cors',
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to delete attendance');
  //     return attendanceId;
  //   },
  // });

  const handleDeleteAttendance = (attendanceId: number) => {
    if (!confirm("Weet u zeker dat u deze aanwezigheid wilt verwijderen?")) return;

    // TODO: Uncomment when backend endpoint is ready
    // deleteAttendanceMutation.mutate(attendanceId, {
    //   onSuccess: (deletedId) => {
    //     setAttendances(attendances.filter(a => a.attendanceId !== deletedId));
    //     toast.success("Aanwezigheid succesvol verwijderd");
    //   },
    //   onError: (error) => {
    //     console.error('Error deleting attendance:', error);
    //     toast.error("Fout bij het verwijderen van aanwezigheid");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['attendance'] });
    //   },
    // });
    // return;

    // Mock delete
    setAttendances(attendances.filter(a => a.attendanceId !== attendanceId));
    toast.success("Aanwezigheid succesvol verwijderd (demo)");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-green-500"><CheckCircleIcon className="h-3 w-3 mr-1" /> Aanwezig</Badge>;
      case "Remote":
        return <Badge className="bg-blue-500"><ClockIcon className="h-3 w-3 mr-1" /> Op afstand</Badge>;
      case "Late":
        return <Badge className="bg-yellow-500"><ClockIcon className="h-3 w-3 mr-1" /> Te laat</Badge>;
      case "Absent":
        return <Badge variant="destructive"><XCircleIcon className="h-3 w-3 mr-1" /> Afwezig</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate statistics
  const totalDays = attendances.length;
  const presentDays = attendances.filter(a => a.status === "Present").length;
  const remoteDays = attendances.filter(a => a.status === "Remote").length;
  const lateDays = attendances.filter(a => a.status === "Late").length;
  const absentDays = attendances.filter(a => a.status === "Absent").length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kantoor aanwezigheid</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Aanwezigheid registreren
            </Button>
          </DialogTrigger>
          <DialogContent>
            <addAttendanceForm.AppForm>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addAttendanceForm.handleSubmit();
                }}
                noValidate
              >
                <DialogHeader>
                  <DialogTitle>Aanwezigheid registreren</DialogTitle>
                  <DialogDescription>Registreer uw aanwezigheid op kantoor</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <addAttendanceForm.AppField
                    name="date"
                    children={(field) => (
                      <field.TextField label="Datum" type="date" />
                    )}
                  />
                  <addAttendanceForm.AppField
                    name="status"
                    children={(field) => (
                      <div>
                        <Label htmlFor={field.name}>Status</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value as "Present" | "Absent" | "Remote" | "Late")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Aanwezig</SelectItem>
                            <SelectItem value="Remote">Op afstand</SelectItem>
                            <SelectItem value="Late">Te laat</SelectItem>
                            <SelectItem value="Absent">Afwezig</SelectItem>
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
                  <addAttendanceForm.Subscribe
                    selector={(state) => state.canSubmit}
                    children={(canSubmit) => (
                      <Button type="submit" disabled={!canSubmit}>
                        Registreren
                      </Button>
                    )}
                  />
                </DialogFooter>
              </form>
            </addAttendanceForm.AppForm>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Section with Pie Chart */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Pie Chart Card - Custom Feature */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle>Aanwezigheid Overzicht</CardTitle>
            </div>
            <CardDescription>
              Visuele verdeling van uw kantooraanwezigheid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendancePieChart
              data={{
                present: presentDays,
                remote: remoteDays,
                late: lateDays,
                absent: absentDays,
              }}
              size="md"
              animated={true}
              showLegend={true}
              showTooltip={true}
              showCenterLabel={true}
            />
          </CardContent>
        </Card>

        {/* Statistics Cards Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 content-start">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Totaal Dagen</CardDescription>
              <CardTitle className="text-3xl">{totalDays}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aanwezig</CardDescription>
              <CardTitle className="text-3xl text-green-600">{presentDays}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">
                {totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0}% van totaal
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Op Afstand</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{remoteDays}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">
                {totalDays > 0 ? ((remoteDays / totalDays) * 100).toFixed(1) : 0}% van totaal
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Te Laat</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{lateDays}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">
                {totalDays > 0 ? ((lateDays / totalDays) * 100).toFixed(1) : 0}% van totaal
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardDescription>Afwezig</CardDescription>
              <CardTitle className="text-3xl text-red-600">{absentDays}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">
                {totalDays > 0 ? ((absentDays / totalDays) * 100).toFixed(1) : 0}% van totaal
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aanwezigheid Geschiedenis</CardTitle>
          <CardDescription>Overzicht van uw kantoor aanwezigheid</CardDescription>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Geen aanwezigheid geregistreerd
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((attendance) => (
                  <TableRow key={attendance.attendanceId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {new Date(attendance.date).toLocaleDateString('nl-NL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(attendance.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAttendance(attendance.attendanceId)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

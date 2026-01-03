import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from "react";
import { CalendarIcon, CheckCircleIcon, ClockIcon, PieChartIcon, PlusIcon, TrashIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import type { CreateAttendance, OfficeAttendance } from "@/types/OfficeAttendance";
import { createAttendanceSchema } from "@/types/OfficeAttendance";
import { useAppForm } from "@/hooks/use-app-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendancePieChart } from "@/components/charts/AttendancePieChart";

export const Route = createFileRoute('/_auth/office-attendance/')({
  component: RouteComponent,
});

export function RouteComponent() {
  const [attendances, setAttendances] = useState<Array<OfficeAttendance>>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
        const res = await fetch(`${API_BASE}/api/attendance`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        const data: Array<OfficeAttendance> = await res.json();
        setAttendances(data);
      } catch {
        toast.error("Kon aanwezigheid niet ophalen");
      }
    };
    fetchAttendances();
  }, []);

  const addAttendanceForm = useAppForm({
    defaultValues: {
      date: "",
      status: "Present" as "Present" | "Absent" | "Remote" | "Late",
    },
    onSubmit: async (values: CreateAttendance) => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
        const res = await fetch(`${API_BASE}/api/attendance`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData?.message || "Fout bij registreren");
        }
        const newAttendance: OfficeAttendance = await res.json();
        setAttendances(prev => [...prev, newAttendance].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
        toast.success("Aanwezigheid succesvol geregistreerd");
        setIsAddDialogOpen(false);
        addAttendanceForm.reset();
      } catch (err: any) {
        toast.error(err.message || "Fout bij registreren");
      }
    },
    validators: { onSubmit: createAttendanceSchema },
  });

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm("Weet u zeker dat u deze aanwezigheid wilt verwijderen?")) return;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
      const res = await fetch(`${API_BASE}/api/attendance/${attendanceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete attendance');
      setAttendances(prev => prev.filter(a => a.attendanceId !== attendanceId));
      toast.success("Aanwezigheid succesvol verwijderd");
    } catch {
      toast.error("Fout bij verwijderen");
    }
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
            <form onSubmit={addAttendanceForm.handleSubmit} noValidate>
              <DialogHeader>
                <DialogTitle>Aanwezigheid registreren</DialogTitle>
                <p className="text-sm text-muted-foreground">Registreer uw aanwezigheid op kantoor</p>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <addAttendanceForm.AppField
                  name="date"
                  children={(field) => <field.TextField label="Datum" type="date" />}
                />
                <addAttendanceForm.AppField
                  name="status"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name}>Status</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as any)}
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
                        <p className="text-sm text-destructive mt-1">{String(field.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                />
              </div>
              <DialogFooter>
                <addAttendanceForm.Subscribe
                  selector={state => state.canSubmit}
                  children={(canSubmit) => (
                    <Button type="submit" disabled={!canSubmit}>Registreren</Button>
                  )}
                />
              </DialogFooter>
            </form>
          </addAttendanceForm.AppForm>
        </DialogContent>

        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="lg:row-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle>Aanwezigheid Overzicht</CardTitle>
            </div>
            <CardDescription>Visuele verdeling van uw kantooraanwezigheid</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendancePieChart
              data={{ present: presentDays, remote: remoteDays, late: lateDays, absent: absentDays }}
              size="md"
              animated
              showLegend
              showTooltip
              showCenterLabel
            />
          </CardContent>
        </Card>

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
              <div className="text-xs text-muted-foreground">{totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : 0}% van totaal</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Op Afstand</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{remoteDays}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">{totalDays ? ((remoteDays / totalDays) * 100).toFixed(1) : 0}% van totaal</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Te Laat</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{lateDays}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">{totalDays ? ((lateDays / totalDays) * 100).toFixed(1) : 0}% van totaal</div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardDescription>Afwezig</CardDescription>
              <CardTitle className="text-3xl text-red-600">{absentDays}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">{totalDays ? ((absentDays / totalDays) * 100).toFixed(1) : 0}% van totaal</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aanwezigheid Geschiedenis</CardTitle>
          <CardDescription>Overzicht van uw kantoor aanwezigheid</CardDescription>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Geen aanwezigheid geregistreerd</p>
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
                {attendances.map(a => (
                  <TableRow key={a.attendanceId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {new Date(a.date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(a.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAttendance(a.attendanceId)}>
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

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import {
    addDays,
    addMonths,
    addWeeks,
    subMonths,
    subWeeks,
} from 'date-fns';
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { DropdownMenuShortcut } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAppForm } from '@/hooks/use-app-form';
import type {
    CalendarEvent,
    CalendarView,
    EventColor,
} from '@/components/event-calendar';

import {
    AgendaDaysToShow,
    AgendaView,
    CalendarDndProvider,
    DayView,
    EventGap,
    EventHeight,
    MonthView,
    WeekCellsHeight,
    WeekView,
} from '@/components/event-calendar';
import { cn } from '@/lib/utils';

export type EventCalendarProps = {
    events?: Array<CalendarEvent>;
    onEventAdd?: (event: CalendarEvent) => void;
    onEventUpdate?: (event: CalendarEvent) => void;
    onEventDelete?: (eventId: string) => void;
    className?: string;
    initialView?: CalendarView;
};
export function EventCalendar({
    events,
    onEventAdd,
    onEventUpdate,
    className,
    initialView = 'month',
}: EventCalendarProps) {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [view, setView] = useState<CalendarView>(initialView);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const form = useAppForm({
        defaultValues: {
            title: "",
            description: "",
            start: new Date().toISOString().slice(0, 16),
            end: new Date(new Date().getTime() + 60 * 60000).toISOString().slice(0, 16),
            allDay: false,
            color: "sky" as EventColor,
        },
        onSubmit: ({ value }) => {
            const newEvent: CalendarEvent = {
                id: Date.now().toString(),
                title: value.title,
                description: value.description || undefined,
                start: new Date(value.start),
                end: new Date(value.end),
                allDay: value.allDay,
                color: value.color,
            };

            onEventAdd?.(newEvent);
            toast.success("Evenement succesvol aangemaakt");
            setIsCreateDialogOpen(false);
            form.reset();
        },
        validators: {
            onSubmit: z.object({
                title: z.string().min(1, "Titel is verplicht").max(100, "Titel mag maximaal 100 karakters zijn"),
                description: z.string().max(500, "Beschrijving mag maximaal 500 karakters zijn"),
                start: z.string().min(1, "Startdatum is verplicht"),
                end: z.string().min(1, "Einddatum is verplicht"),
                allDay: z.boolean(),
                color: z.enum(["sky", "amber", "violet", "rose", "emerald", "orange", "utility-gray"]),
            }),
        },
    });
    // Add keyboard shortcuts for view switching
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setSelectedEvent(selectedEvent);
            // Skip if user is typing in an input, textarea or contentEditable element
            // or if the event dialog is open
            if (
                isEventDialogOpen
                || e.target instanceof HTMLInputElement
                || e.target instanceof HTMLTextAreaElement
                || (e.target instanceof HTMLElement && e.target.isContentEditable)
            ) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'm':
                    setView('month');
                    break;
                case 'w':
                    setView('week');
                    break;
                case 'd':
                    setView('day');
                    break;
                case 'a':
                    setView('agenda');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEventDialogOpen, selectedEvent]);

    const handlePrevious = () => {
        if (view === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        }
        else if (view === 'week') {
            setCurrentDate(subWeeks(currentDate, 1));
        }
        else if (view === 'day') {
            setCurrentDate(addDays(currentDate, -1));
        }
        else {
            // For agenda view, go back 30 days (a full month)
            setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        }
        else if (view === 'week') {
            setCurrentDate(addWeeks(currentDate, 1));
        }
        else if (view === 'day') {
            setCurrentDate(addDays(currentDate, 1));
        }
        else {
            // For agenda view, go forward 30 days (a full month)
            setCurrentDate(addDays(currentDate, AgendaDaysToShow));
        }
    };

    const handleEventSelect = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsEventDialogOpen(true);
    };

    const handleEventCreate = () => {
        setIsCreateDialogOpen(true);
    };

    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        onEventUpdate?.(updatedEvent);
    };

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.handleSubmit();
    }

    // Use currentDate for dynamic header values
    const oneJanuary = new Date(currentDate.getFullYear(), 0, 1);
    const currentWeek = Math.ceil((((currentDate.getTime() - oneJanuary.getTime()) / 86400000) + oneJanuary.getDay() + 1) / 7);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Calculate next month and year for date range display
    const nextMonth = (currentDate.getMonth() + 1) % 12;
    const nextMonthYear = currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();

    return (
        <div
            className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
            style={
                {
                    '--event-height': `${EventHeight}px`,
                    '--event-gap': `${EventGap}px`,
                    '--week-cells-height': `${WeekCellsHeight}px`,
                } as React.CSSProperties
            }
        >
            <CalendarDndProvider onEventUpdate={handleEventUpdate}>
                <div
                    className={cn(
                        'flex items-center justify-between p-2 sm:p-4 bg-card/30 border-b border-primary/20',
                        className,
                    )}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                        <div className="flex flex-row p-3 gap-3">
                            <div
                                className="w-16 h-14 rotate-0 opacity-100 rounded-md border border-primary/30 flex text-center flex-col bg-card shadow-sm"
                            >
                                <div className="bg-primary/10 font-semibold text-primary-foreground border-b border-primary/20">
                                    {["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][currentDate.getMonth()]}
                                </div>
                                <div className="text-primary-foreground text-lg font-bold">
                                    {currentDate.getDate()}
                                </div>
                            </div>
                            <div>
                                <h2 className="flex flex-row gap-2">
                                    <div className="text-xl font-semibold text-foreground">
                                        {["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"][currentDate.getMonth()]}
                                        {' '}
                                        {currentDate.getFullYear()}
                                    </div>
                                    <div className="text-xs">
                                        <span className="inline-block px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary-foreground text-xs font-medium align-middle mt-1">
                                            Week {currentWeek}
                                        </span>
                                    </div>
                                </h2>
                                <p className="mt-1 text-muted-foreground text-base">
                                    {["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][currentDate.getMonth()]}
                                    {' '}1, {currentDate.getFullYear()} - {["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][nextMonth]}
                                    {' '}{daysInMonth}, {nextMonthYear}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-4">
                        <Button
                            variant="default"
                            onClick={handleEventCreate}
                            className="gap-2 bg-primary-foreground text-primary hover:bg-primary-hover-secondary max-sm:text-sm cursor-pointer"
                        >
                            <span className="max-sm:hidden">Evenement aanmaken</span>
                            <span className="sm:hidden">+ Event</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevious}
                            aria-label="Previous"
                        >
                            <ChevronLeftIcon size={16} aria-hidden="true" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                                        <span>
                                            <span className="min-[480px]:hidden" aria-hidden="true">
                                                {view === 'day' && (<>Dag</>)}
                                                {view === 'week' && (<>Week</>)}
                                                {view === 'month' && (<>Maand</>)}
                                                {view === 'agenda' && (<>Agenda</>)}
                                            </span>
                                            <span className="max-[479px]:sr-only">
                                                {view === 'day' && (<>Dag</>)}
                                                {view === 'week' && (<>Week</>)}
                                                {view === 'month' && (<>Maand</>)}
                                                {view === 'agenda' && (<>Agenda</>)}
                                            </span>
                                        </span>
                                        <ChevronDownIcon
                                            className="-me-1 opacity-60"
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-32">
                                    <DropdownMenuItem onClick={() => setView('month')}>
                                        Maand
                                        {' '}
                                        <DropdownMenuShortcut>M</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setView('week')}>
                                        Week
                                        {' '}
                                        <DropdownMenuShortcut>W</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center sm:gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNext}
                                aria-label="Next"
                            >
                                <ChevronRightIcon size={16} aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col">
                    {view === 'month' && (
                        <MonthView
                            currentDate={currentDate}
                            events={events ?? []}
                            onEventSelect={handleEventSelect}
                            onEventCreate={handleEventCreate}
                        />
                    )}
                    {view === 'week' && (
                        <WeekView
                            currentDate={currentDate}
                            events={events ?? []}
                            onEventSelect={handleEventSelect}
                            onEventCreate={handleEventCreate}
                        />
                    )}
                    {view === 'day' && (
                        <DayView
                            currentDate={currentDate}
                            events={events ?? []}
                            onEventSelect={handleEventSelect}
                            onEventCreate={handleEventCreate}
                        />
                    )}
                    {view === 'agenda' && (
                        <AgendaView
                            currentDate={currentDate}
                            events={events ?? []}
                            onEventSelect={handleEventSelect}
                        />
                    )}
                </div>
            </CalendarDndProvider>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Evenement aanmaken</DialogTitle>
                        <DialogDescription>
                            Vul de onderstaande gegevens in om een nieuw evenement aan te maken.
                        </DialogDescription>
                    </DialogHeader>
                    <form.AppForm>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <form.AppField
                                name="title"
                                children={(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="title" className="text-primary-foreground">Titel *</Label>
                                        <Input
                                            id="title"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Voer de titel in..."
                                            className="focus-visible:ring-2 focus-visible:ring-primary/50"
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <span className="text-sm text-destructive">
                                                {typeof field.state.meta.errors[0] === 'string' 
                                                    ? field.state.meta.errors[0] 
                                                    : field.state.meta.errors[0]?.message || 'Validatiefout'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                            <form.AppField
                                name="description"
                                children={(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="description" className="text-primary-foreground">Beschrijving</Label>
                                        <Textarea
                                            id="description"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Voer de beschrijving in..."
                                            rows={3}
                                            className="focus-visible:ring-2 focus-visible:ring-primary/50"
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <span className="text-sm text-destructive">
                                                {typeof field.state.meta.errors[0] === 'string' 
                                                    ? field.state.meta.errors[0] 
                                                    : field.state.meta.errors[0]?.message || 'Validatiefout'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <form.AppField
                                    name="start"
                                    children={(field) => (
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="start" className="text-primary-foreground">Startdatum *</Label>
                                            <Input
                                                id="start"
                                                type="datetime-local"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="focus-visible:ring-2 focus-visible:ring-primary/50 scheme-dark"
                                            />
                                            {field.state.meta.errors.length > 0 && (
                                                <span className="text-sm text-destructive">
                                                    {typeof field.state.meta.errors[0] === 'string' 
                                                        ? field.state.meta.errors[0] 
                                                        : field.state.meta.errors[0]?.message || 'Validatiefout'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                />
                                <form.AppField
                                    name="end"
                                    children={(field) => (
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="end" className="text-primary-foreground">Einddatum *</Label>
                                            <Input
                                                id="end"
                                                type="datetime-local"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="focus-visible:ring-2 focus-visible:ring-primary/50 scheme-dark"
                                            />
                                            {field.state.meta.errors.length > 0 && (
                                                <span className="text-sm text-destructive">
                                                    {typeof field.state.meta.errors[0] === 'string' 
                                                        ? field.state.meta.errors[0] 
                                                        : field.state.meta.errors[0]?.message || 'Validatiefout'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                            <form.AppField
                                name="color"
                                children={(field) => (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="color" className="text-primary-foreground">Kleur</Label>
                                        <select
                                            id="color"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value as EventColor)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                                        >
                                            <option value="sky">Blauw</option>
                                            <option value="amber">Amber</option>
                                            <option value="violet">Violet</option>
                                            <option value="rose">Roze</option>
                                            <option value="emerald">Groen</option>
                                            <option value="orange">Oranje</option>
                                            <option value="utility-gray">Grijs</option>
                                        </select>
                                    </div>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                >
                                    Annuleren
                                </Button>
                                <form.Subscribe
                                    selector={(state) => state.canSubmit}
                                    children={(canSubmit) => (
                                        <Button type="submit" disabled={!canSubmit}>
                                            Aanmaken
                                        </Button>
                                    )}
                                />
                            </DialogFooter>
                        </form>
                    </form.AppForm>
                </DialogContent>
            </Dialog>
        </div>
    );
}

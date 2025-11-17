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
import { useEffect, useState } from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { DropdownMenuShortcut } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import type {
    CalendarEvent,
    CalendarView,
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
    onEventUpdate,
    className,
    initialView = 'month',
}: EventCalendarProps) {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [view, setView] = useState<CalendarView>(initialView);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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

    };

    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        onEventUpdate?.(updatedEvent);
    };

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
                        'flex items-center justify-between p-2 sm:p-4',
                        className,
                    )}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                        <div className="flex flex-row p-3 gap-3">
                            <div
                                className="w-16 h-14 rotate-0 opacity-100 rounded-md border flex text-center flex-col bg-[#FFFFFF]"
                            >
                                <div className="bg-[#FAFAFA] font-semibold text-quaternary">
                                    {["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][currentDate.getMonth()]}
                                </div>
                                <div className="text-brand-secondary text-lg font-bold">
                                    {currentDate.getDate()}
                                </div>
                            </div>
                            <div>
                                <h2 className="flex flex-row gap-2">
                                    <div className="text-xl font-semibold">
                                        {["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"][currentDate.getMonth()]}
                                        {' '}
                                        {currentDate.getFullYear()}
                                    </div>
                                    <div className="text-xs border-[#D5D7DA]">
                                        <span className="inline-block px-2 py-0.5 rounded-full border border-[#D5D7DA] text-xs font-medium align-middle mt-1">
                                            Week {currentWeek}
                                        </span>
                                    </div>
                                </h2>
                                <p className="mt-1 text-text-primary/70 text-base">
                                    {["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][currentDate.getMonth()]}
                                    {' '}1, {currentDate.getFullYear()} - {["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][nextMonth]}
                                    {' '}{daysInMonth}, {nextMonthYear}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-4">
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
        </div>
    );
}

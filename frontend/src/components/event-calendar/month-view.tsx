import {
    addDays,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { nl } from 'date-fns/locale';
import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from '../ui/button';

import type { CalendarEvent } from '@/components/event-calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import {
    DraggableEvent,
    DroppableCell,
    EventGap,
    EventHeight,
    EventItem,
    getAllEventsForDay,
    getEventsForDay,
    getSpanningEventsForDay,
    sortEvents,
    useEventVisibility,

} from '@/components/event-calendar';

type MonthViewProps = {
    currentDate: Date;
    events: Array<CalendarEvent>;
    onEventSelect: (event: CalendarEvent) => void;
};

export function MonthView({
    currentDate,
    events,
    onEventSelect,
}: MonthViewProps) {
    const days = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        // Use locale to determine week start (e.g., Monday for nl, Sunday for en-US/en-GB as configured by locale)
        const calendarStart = startOfWeek(monthStart, { locale: nl });
        const calendarEnd = endOfWeek(monthEnd, { locale: nl });

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate, nl]);

    const weekdays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(startOfWeek(new Date(), { locale: nl }), i);
            return format(date, 'EEE', { locale: nl });
        });
    }, [nl]);

    const weeks = useMemo(() => {
        const result = [];
        let week = [];

        for (let i = 0; i < days.length; i++) {
            week.push(days[i]);
            if (week.length === 7 || i === days.length - 1) {
                result.push(week);
                week = [];
            }
        }

        return result;
    }, [days]);

    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        onEventSelect(event);
    };

    const isMountedRef = useRef(false);
    const { contentRef, getVisibleEventCount } = useEventVisibility({
        eventHeight: EventHeight,
        eventGap: EventGap,
    });

    useEffect(() => {
        isMountedRef.current = true;
    }, []);

    return (
        <div data-slot="month-view" className="contents">
            <div className="bg-card/50 border-primary/20 grid grid-cols-7 border-b">
                {weekdays.map(day => (
                    <div
                        key={day}
                        className="text-primary-foreground font-medium py-2 text-center text-sm"
                    >
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid flex-1 auto-rows-fr">
                {weeks.map(week => (
                    <div
                        key={week[0] ? `week-${week[0].toISOString()}` : 'week-0'}
                        className="grid grid-cols-7 [&:last-child>*]:border-b-0"
                    >
                        {week.map((day, dayIndex) => {
                            const dayEvents = getEventsForDay(events, day);
                            const spanningEvents = getSpanningEventsForDay(events, day);
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const cellId = `month-cell-${day.toISOString()}`;
                            const allDayEvents = [...spanningEvents, ...dayEvents];
                            const allEvents = getAllEventsForDay(events, day);

                            const isReferenceCell = weeks[0] === week && dayIndex === 0;
                            const visibleCount = isMountedRef.current
                                ? getVisibleEventCount(allDayEvents.length)
                                : undefined;
                            const hasMore
                                = visibleCount !== undefined && allDayEvents.length > visibleCount;
                            const remainingCount = hasMore
                                ? allDayEvents.length - visibleCount
                                : 0;

                            return (
                                <div
                                    key={day.toString()}
                                    className="group border-primary/10 bg-card/20 data-outside-cell:bg-muted/10 data-outside-cell:text-muted-foreground/50 border-r border-b last:border-r-0 hover:bg-card/40 transition-colors"
                                    data-today={isToday(day) || undefined}
                                    data-outside-cell={!isCurrentMonth || undefined}
                                >
                                    <DroppableCell
                                        id={cellId}
                                        date={day}
                                    >
                                        <div className="group-data-today:bg-primary-foreground group-data-today:text-primary group-data-today:font-bold group-data-today:shadow-md mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm text-foreground/80">
                                            {format(day, 'd', { locale: nl })}
                                        </div>
                                        <div
                                            ref={isReferenceCell ? contentRef : null}
                                            className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                                        >
                                            {sortEvents(allDayEvents).map((event, index) => {
                                                const eventStart = new Date(event.start);
                                                const eventEnd = new Date(event.end ?? event.start);
                                                const isFirstDay = isSameDay(day, eventStart);
                                                const isLastDay = isSameDay(day, eventEnd);

                                                const isHidden
                                                    = isMountedRef.current && visibleCount && index >= visibleCount;

                                                if (!visibleCount)
                                                    return null;

                                                if (!isFirstDay) {
                                                    return (
                                                        <div
                                                            key={`spanning-${event.id}-${day.toISOString().slice(0, 10)}`}
                                                            className="aria-hidden:hidden"

                                                        >
                                                            <EventItem
                                                                onClick={e => handleEventClick(event, e)}
                                                                event={event}
                                                                view="month"
                                                                isFirstDay={isFirstDay}
                                                                isLastDay={isLastDay}
                                                            >
                                                                <div className="invisible">
                                                                    {!event.allDay && (
                                                                        <span>
                                                                            {format(
                                                                                new Date(event.start),
                                                                                'HH:mm',
                                                                                { locale: nl },
                                                                            )}
                                                                            {' '}
                                                                        </span>
                                                                    )}
                                                                    {event.title}
                                                                </div>
                                                            </EventItem>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={isHidden ? 'hidden' : ''}
                                                    >
                                                        <DraggableEvent
                                                            event={event}
                                                            view="month"
                                                            onClick={e => handleEventClick(event, e)}
                                                            isFirstDay={isFirstDay}
                                                            isLastDay={isLastDay}
                                                        />
                                                    </div>
                                                );
                                            })}

                                            {hasMore && (
                                                <Popover modal>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="focus-visible:border-ring bg-card/60 border border-primary/20 focus-visible:ring-ring/50 text-primary-foreground hover:text-foreground hover:bg-primary/20 hover:border-primary/40 mt-(--event-gap) flex h-(--event-height) w-full items-center justify-start overflow-hidden rounded px-1 text-left text-[10px] backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] sm:px-2 sm:text-xs"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <span>
                                                                +
                                                                {' '}
                                                                {remainingCount}
                                                                {' '}
                                                                <span className="max-sm:sr-only">meer</span>
                                                            </span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        align="center"
                                                        className="max-w-52 p-3"
                                                        style={
                                                            {
                                                                '--event-height': `${EventHeight}px`,
                                                            } as React.CSSProperties
                                                        }
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-medium">
                                                                {format(day, 'd MMM, EEEE', { locale: nl })}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {sortEvents(allEvents)
                                                                    .slice(visibleCount)
                                                                    .map((event) => {
                                                                        const eventStart = new Date(event.start);
                                                                        const eventEnd = new Date(event.end ?? event.start);
                                                                        const isFirstDay = isSameDay(day, eventStart);
                                                                        const isLastDay = isSameDay(day, eventEnd);

                                                                        return (
                                                                            <EventItem
                                                                                key={event.id}
                                                                                onClick={e =>
                                                                                    handleEventClick(event, e)}
                                                                                event={event}
                                                                                view="month"
                                                                                isFirstDay={isFirstDay}
                                                                                isLastDay={isLastDay}
                                                                            />
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    </DroppableCell>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

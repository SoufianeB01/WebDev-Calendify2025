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
import { enGB, nl } from 'date-fns/locale';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
import { DefaultStartHour } from '@/components/event-calendar/constants';

type MonthViewProps = {
    currentDate: Date;
    events: Array<CalendarEvent>;
    onEventSelect: (event: CalendarEvent) => void;
    onEventCreate: (startTime: Date) => void;
};

export function MonthView({
    currentDate,
    events,
    onEventSelect,
    onEventCreate,
}: MonthViewProps) {
    const { i18n } = useTranslation();
    // Map i18n language to date-fns locale. Extend as more languages are supported.
    const dateFnsLocale = useMemo(() => {
        const lang = i18n.language || 'en-GB';
        if (lang.startsWith('nl'))
            return nl;
        return enGB;
    }, [i18n.language]);
    const days = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        // Use locale to determine week start (e.g., Monday for nl, Sunday for en-US/en-GB as configured by locale)
        const calendarStart = startOfWeek(monthStart, { locale: dateFnsLocale });
        const calendarEnd = endOfWeek(monthEnd, { locale: dateFnsLocale });

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate, dateFnsLocale]);

    const weekdays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(startOfWeek(new Date(), { locale: dateFnsLocale }), i);
            return format(date, 'EEE', { locale: dateFnsLocale });
        });
    }, [dateFnsLocale]);

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
    const { t } = useTranslation('dashboard');
    useEffect(() => {
        isMountedRef.current = true;
    }, []);

    return (
        <div data-slot="month-view" className="contents">
            <div className="border-border/70 grid grid-cols-7 border-b">
                {weekdays.map(day => (
                    <div
                        key={day}
                        className="text-muted-foreground/70 py-2 text-center text-sm"
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
                            if (!day)
                                return null; // Skip if day is undefined

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
                                    className="group border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70 border-r border-b last:border-r-0"
                                    data-today={isToday(day) || undefined}
                                    data-outside-cell={!isCurrentMonth || undefined}
                                >
                                    <DroppableCell
                                        id={cellId}
                                        date={day}
                                        onClick={() => {
                                            const startTime = new Date(day);
                                            startTime.setHours(DefaultStartHour, 0, 0);
                                            onEventCreate(startTime);
                                        }}
                                    >
                                        <div className="group-data-today:bg-primary group-data-today:text-primary-foreground mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm">
                                            {format(day, 'd', { locale: dateFnsLocale })}
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
                                                                                { locale: dateFnsLocale },
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
                                                            className="focus-visible:border-ring !bg-primary-foreground focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-[var(--event-gap)] flex h-[var(--event-height)] w-full items-center overflow-hidden px-1 text-left text-[10px] backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] sm:px-2 sm:text-xs"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <span>
                                                                +
                                                                {' '}
                                                                {remainingCount}
                                                                {' '}
                                                                <span className="max-sm:sr-only">{t('dashboard.planning.message.moreMsgs')}</span>
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
                                                                {format(day, 'd MMM, EEEE', { locale: dateFnsLocale })}
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

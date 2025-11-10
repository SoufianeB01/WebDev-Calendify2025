import {
    addHours,
    areIntervalsOverlapping,
    differenceInMinutes,
    eachDayOfInterval,
    eachHourOfInterval,
    endOfWeek,
    format,
    getHours,
    getMinutes,
    isBefore,
    isSameDay,
    isToday,
    startOfDay,
    startOfWeek,
} from 'date-fns';
import { enGB, nl } from 'date-fns/locale';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover';
import { Button } from '../ui/button';

import type { CalendarEvent } from '@/components/event-calendar';

import {
    DraggableEvent,
    DroppableCell,
    EventHeight,
    EventItem,
    WeekCellsHeight,
    isMultiDayEvent,
    useCurrentTimeIndicator,

} from '@/components/event-calendar';
import { EndHour, StartHour } from '@/components/event-calendar/constants';
import { cn } from '@/lib/utils';

type WeekViewProps = {
    currentDate: Date;
    events: Array<CalendarEvent>;
    onEventSelect: (event: CalendarEvent) => void;
    onEventCreate: (startTime: Date) => void;
};

type PositionedEvent = {
    event: CalendarEvent;
    top: number;
    height: number;
    left: number;
    width: number;
    zIndex: number;
};

export function WeekView({
    currentDate,
    events,
    onEventSelect,
    onEventCreate,
}: WeekViewProps) {
    const { i18n, t } = useTranslation('dashboard');
    const dateFnsLocale = useMemo(() => {
        const lang = i18n.language || 'en-GB';
        if (lang.startsWith('nl'))
            return nl;
        return enGB;
    }, [i18n.language]);

    const days = useMemo(() => {
        const weekStart = startOfWeek(currentDate, { locale: dateFnsLocale });
        const weekEnd = endOfWeek(currentDate, { locale: dateFnsLocale });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }, [currentDate, dateFnsLocale]);

    const weekStart = useMemo(
        () => startOfWeek(currentDate, { locale: dateFnsLocale }),
        [currentDate, dateFnsLocale],
    );

    const hours = useMemo(() => {
        const dayStart = startOfDay(currentDate);
        return eachHourOfInterval({
            start: addHours(dayStart, StartHour),
            end: addHours(dayStart, EndHour - 1),
        });
    }, [currentDate]);

    // Get all-day events and multi-day events for the week
    const allDayEvents = useMemo(() => {
        return events
            .filter((event) => {
                // Include explicitly marked all-day events or multi-day events
                return event.allDay || isMultiDayEvent(event);
            })
            .filter((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end ?? event.start);
                return days.some(
                    day =>
                        isSameDay(day, eventStart)
                        || isSameDay(day, eventEnd)
                        || (day > eventStart && day < eventEnd),
                );
            });
    }, [events, days]);

    // Process events for each day to calculate positions
    const processedDayEvents = useMemo(() => {
        const result = days.map((day) => {
            // Get events for this day that are not all-day events or multi-day events
            const dayEvents = events.filter((event) => {
                // Skip all-day events and multi-day events
                if (event.allDay || isMultiDayEvent(event))
                    return false;

                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end ?? event.start);

                // Check if event is on this day
                return (
                    isSameDay(day, eventStart)
                    || isSameDay(day, eventEnd)
                    || (eventStart < day && eventEnd > day)
                );
            });

            // Sort events by start time and duration
            const sortedEvents = [...dayEvents].sort((a, b) => {
                const aStart = new Date(a.start);
                const bStart = new Date(b.start);
                const aEnd = new Date(a.end ?? a.start);
                const bEnd = new Date(b.end ?? b.start);

                // First sort by start time
                if (aStart < bStart)
                    return -1;
                if (aStart > bStart)
                    return 1;

                // If start times are equal, sort by duration (longer events first)
                const aDuration = differenceInMinutes(aEnd, aStart);
                const bDuration = differenceInMinutes(bEnd, bStart);
                return bDuration - aDuration;
            });

            // Group events by hour to determine which should be stacked
            const eventsByHour = new Map<number, CalendarEvent[]>();

            sortedEvents.forEach((event) => {
                const eventStart = new Date(event.start);
                const adjustedStart = isSameDay(day, eventStart) ? eventStart : startOfDay(day);
                const startHour = getHours(adjustedStart);

                if (!eventsByHour.has(startHour)) {
                    eventsByHour.set(startHour, []);
                }
                eventsByHour.get(startHour)!.push(event);
            });

            // Calculate positions for each event
            const positionedEvents: PositionedEvent[] = [];
            const dayStart = startOfDay(day);

            // Track columns for overlapping events
            const columns: { event: CalendarEvent; end: Date }[][] = [];

            sortedEvents.forEach((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end ?? event.start);

                // Adjust start and end times if they're outside this day
                const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart;
                const adjustedEnd = isSameDay(day, eventEnd)
                    ? eventEnd
                    : addHours(dayStart, 24);

                // Calculate top position and height
                const startHour
                    = getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
                const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

                // Adjust the top calculation to account for the new start time
                const top = (startHour - StartHour) * WeekCellsHeight;
                const height = (endHour - startHour) * WeekCellsHeight;

                // Check if there are multiple events in this hour
                const hourEvents = eventsByHour.get(getHours(adjustedStart)) || [];
                const shouldStack = hourEvents.length >= 2;

                if (shouldStack) {
                    // For stacked events, use full width
                    positionedEvents.push({
                        event,
                        top,
                        height,
                        left: 0,
                        width: 1,
                        zIndex: 10,
                    });
                }
                else {
                    // Original column-based positioning for single or non-stacked events
                    // Find a column for this event
                    let columnIndex = 0;
                    let placed = false;

                    while (!placed) {
                        const col = columns[columnIndex] || [];
                        if (col.length === 0) {
                            columns[columnIndex] = col;
                            placed = true;
                        }
                        else {
                            const overlaps = col.some(c =>
                                areIntervalsOverlapping(
                                    { start: adjustedStart, end: adjustedEnd },
                                    {
                                        start: new Date(c.event.start),
                                        end: new Date(c.event.end ?? c.event.start),
                                    },
                                ),
                            );
                            if (!overlaps) {
                                placed = true;
                            }
                            else {
                                columnIndex++;
                            }
                        }
                    }

                    // Ensure column is initialized before pushing
                    const currentColumn = columns[columnIndex] || [];
                    columns[columnIndex] = currentColumn;
                    currentColumn.push({ event, end: adjustedEnd });

                    // Calculate width and left position based on number of columns
                    const width = columnIndex === 0 ? 1 : 1 - (columnIndex * 0.1);
                    const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

                    positionedEvents.push({
                        event,
                        top,
                        height,
                        left,
                        width,
                        zIndex: 10 + columnIndex, // Higher columns get higher z-index
                    });
                }
            });

            return positionedEvents;
        });

        return result;
    }, [days, events]);

    // Group events by hour for each day to show stacked layout
    const eventsByDayAndHour = useMemo(() => {
        const result = days.map((day) => {
            const hourGroups = new Map<number, CalendarEvent[]>();

            // Get events for this day that are not all-day events or multi-day events
            const dayEvents = events.filter((event) => {
                if (event.allDay || isMultiDayEvent(event))
                    return false;

                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end ?? event.start);

                return (
                    isSameDay(day, eventStart)
                    || isSameDay(day, eventEnd)
                    || (eventStart < day && eventEnd > day)
                );
            });

            dayEvents.forEach((event) => {
                const eventStart = new Date(event.start);
                const adjustedStart = isSameDay(day, eventStart) ? eventStart : startOfDay(day);
                const startHour = Math.floor(getHours(adjustedStart));

                if (!hourGroups.has(startHour)) {
                    hourGroups.set(startHour, []);
                }
                hourGroups.get(startHour)!.push(event);
            });

            return hourGroups;
        });

        return result;
    }, [days, events]);

    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        onEventSelect(event);
    };

    const showAllDaySection = allDayEvents.length > 0;
    const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
        currentDate,
        'week',
    );

    return (
        <div data-slot="week-view" className="flex h-full flex-col">
            <div className="bg-background/80 border-border/70 sticky top-0 z-30 grid grid-cols-8 border-b backdrop-blur-md">
                <div className="text-muted-foreground/70 py-2 text-center text-sm">
                    <span className="max-[479px]:sr-only">{format(new Date(), 'O')}</span>
                </div>
                {days.map(day => (
                    <div
                        key={day.toString()}
                        className="data-today:text-foreground text-muted-foreground/70 py-2 text-center text-sm data-today:font-medium"
                        data-today={isToday(day) || undefined}
                    >
                        <span className="sm:hidden" aria-hidden="true">
                            {format(day, 'E', { locale: dateFnsLocale })[0]}
                            {' '}
                            {format(day, 'd', { locale: dateFnsLocale })}
                        </span>
                        <span className="max-sm:hidden">{format(day, 'EEE dd', { locale: dateFnsLocale })}</span>
                    </div>
                ))}
            </div>

            {showAllDaySection && (
                <div className="border-border/70 bg-muted/50 border-b">
                    <div className="grid grid-cols-8">
                        <div className="border-border/70 relative border-r">
                            <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                                {t('planning.allDay', 'All day')}
                            </span>
                        </div>
                        {days.map((day, dayIndex) => {
                            const dayAllDayEvents = allDayEvents.filter((event) => {
                                const eventStart = new Date(event.start);
                                const eventEnd = new Date(event.end ?? event.start);
                                return (
                                    isSameDay(day, eventStart)
                                    || (day > eventStart && day < eventEnd)
                                    || isSameDay(day, eventEnd)
                                );
                            });

                            return (
                                <div
                                    key={day.toString()}
                                    className="border-border/70 relative border-r p-1 last:border-r-0"
                                    data-today={isToday(day) || undefined}
                                >
                                    {dayAllDayEvents.map((event) => {
                                        const eventStart = new Date(event.start);
                                        const eventEnd = new Date(event.end ?? event.start);
                                        const isFirstDay = isSameDay(day, eventStart);
                                        const isLastDay = isSameDay(day, eventEnd);

                                        // Check if this is the first day in the current week view
                                        const isFirstVisibleDay
                                            = dayIndex === 0 && isBefore(eventStart, weekStart);
                                        const shouldShowTitle = isFirstDay || isFirstVisibleDay;

                                        return (
                                            <EventItem
                                                key={`spanning-${event.id}`}
                                                onClick={e => handleEventClick(event, e)}
                                                event={event}
                                                view="month"
                                                isFirstDay={isFirstDay}
                                                isLastDay={isLastDay}
                                            >
                                                {/* Show title if it's the first day of the event or the first visible day in the week */}
                                                <div
                                                    className={cn(
                                                        'truncate',
                                                        !shouldShowTitle && 'invisible',
                                                    )}

                                                >
                                                    {event.title}
                                                </div>
                                            </EventItem>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid flex-1 grid-cols-8 overflow-hidden">
                <div className="border-border/70 grid auto-cols-fr border-r">
                    {hours.map((hour, index) => (
                        <div
                            key={hour.toString()}
                            className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
                        >
                            {index > 0 && (
                                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                                    {format(hour, 'HH:mm')}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {days.map((day, dayIndex) => {
                    const dayHourGroups = eventsByDayAndHour[dayIndex] || new Map();

                    return (
                        <div
                            key={day.toString()}
                            className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
                            data-today={isToday(day) || undefined}
                        >
                            {/* Current time indicator - only show for today's column */}
                            {currentTimeVisible && isToday(day) && (
                                <div
                                    className="pointer-events-none absolute right-0 left-0 z-20"
                                    style={{ top: `${currentTimePosition}%` }}
                                >
                                    <div className="relative flex items-center">
                                        <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                                        <div className="bg-primary h-[2px] w-full"></div>
                                    </div>
                                </div>
                            )}
                            {hours.map((hour) => {
                                const hourValue = getHours(hour);
                                let hourEvents = dayHourGroups.get(hourValue) || [];
                                // Sort by start time ascending
                                hourEvents = [...hourEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                                const hasMultipleEvents = hourEvents.length >= 2;

                                // Always show the first event in the hour, not the latest
                                const visibleEvents = hasMultipleEvents
                                    ? hourEvents.slice(0, 1)
                                    : hourEvents;
                                const remainingEvents = hasMultipleEvents
                                    ? hourEvents.slice(1)
                                    : [];
                                const remainingCount = remainingEvents.length;

                                return (
                                    <div
                                        key={hour.toString()}
                                        className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
                                    >
                                        {/* Stacked events for hours with 2+ events */}
                                        {hasMultipleEvents && (
                                            <div className="absolute inset-0 z-10 flex flex-col gap-1 p-1">
                                                {visibleEvents.map((event) => {
                                                    const eventStart = new Date(event.start);
                                                    const eventEnd = new Date(event.end ?? event.start);
                                                    const isFirstDay = isSameDay(day, eventStart);
                                                    const isLastDay = isSameDay(day, eventEnd);

                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className="flex-shrink-0"
                                                            style={{ height: `${EventHeight}px` }}
                                                        >
                                                            <EventItem
                                                                onClick={e => handleEventClick(event, e)}
                                                                event={event}
                                                                view="month"
                                                                isFirstDay={isFirstDay}
                                                                isLastDay={isLastDay}
                                                            >
                                                                {/* <span className="flex w-full min-w-0 items-center justify-between">
                                                                    <div className="flex flex-col gap-2 w-full">
                                                                        <div className="flex flex-row justify-between w-full">
                                                                            <span className="truncate">{event.title}</span>
                                                                            {!event.allDay && (
                                                                                <span className="shrink-0 font-normal opacity-70 sm:text-[11px]">
                                                                                    {formatTimeWithOptionalMinutes(displayStart)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {isLocationComplete && <span className="truncate">{`${event.location?.Street} ${event.location?.StreetNumber}`}</span>}
                                                                    </div>
                                                                </span> */}
                                                            </EventItem>
                                                        </div>
                                                    );
                                                })}

                                                {remainingCount > 0 && (
                                                    <Popover modal>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                className="focus-visible:border-ring !bg-primary-foreground focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center overflow-hidden px-1 text-left text-sm backdrop-blur-md transition outline-none select-none focus-visible:ring-2 sm:px-2 sm:text-xs"
                                                                style={{ height: `${EventHeight}px` }}
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <span>
                                                                    +
                                                                    {' '}
                                                                    {remainingCount}
                                                                    {' '}
                                                                    <span className="max-sm:sr-only">{t('planning.message.moreMsgs', 'more')}</span>
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
                                                                    {remainingEvents.map((event) => {
                                                                        const eventStart = new Date(event.start);
                                                                        const eventEnd = new Date(event.end ?? event.start);
                                                                        const isFirstDay = isSameDay(day, eventStart);
                                                                        const isLastDay = isSameDay(day, eventEnd);

                                                                        return (
                                                                            <EventItem
                                                                                key={event.id}
                                                                                onClick={e => handleEventClick(event, e)}
                                                                                event={event}
                                                                                view="month"
                                                                                isFirstDay={isFirstDay}
                                                                                isLastDay={isLastDay}
                                                                            >
                                                                            </EventItem>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                        )}

                                        {/* Regular positioned events for hours with 0-1 events */}
                                        {!hasMultipleEvents && (processedDayEvents[dayIndex] ?? [])
                                            .filter((pe) => {
                                                const eventStart = new Date(pe.event.start);
                                                const adjustedStart = isSameDay(day, eventStart) ? eventStart : startOfDay(day);
                                                return Math.floor(getHours(adjustedStart)) === hourValue;
                                            })
                                            .map(positionedEvent => (
                                                <div
                                                    key={positionedEvent.event.id}
                                                    className="absolute z-10 px-0.5"
                                                    style={{
                                                        top: `${positionedEvent.top - (hourValue - StartHour) * WeekCellsHeight}px`,
                                                        height: `${positionedEvent.height}px`,
                                                        left: `${positionedEvent.left * 100}%`,
                                                        width: `${positionedEvent.width * 100}%`,
                                                        zIndex: positionedEvent.zIndex,
                                                    }}
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <div className="h-full w-full">
                                                        <DraggableEvent
                                                            event={positionedEvent.event}
                                                            view="week"
                                                            onClick={e => handleEventClick(positionedEvent.event, e)}
                                                            showTime
                                                            height={positionedEvent.height}
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                        {/* Quarter-hour intervals */}
                                        {[0, 1, 2, 3].map((quarter) => {
                                            const quarterHourTime = hourValue + quarter * 0.25;
                                            return (
                                                <DroppableCell
                                                    key={`${hour.toString()}-${quarter}`}
                                                    id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                                                    date={day}
                                                    time={quarterHourTime}
                                                    className={cn(
                                                        'absolute h-[calc(var(--week-cells-height)/4)] w-full',
                                                        quarter === 0 && 'top-0',
                                                        quarter === 1
                                                        && 'top-[calc(var(--week-cells-height)/4)]',
                                                        quarter === 2
                                                        && 'top-[calc(var(--week-cells-height)/4*2)]',
                                                        quarter === 3
                                                        && 'top-[calc(var(--week-cells-height)/4*3)]',
                                                    )}
                                                    onClick={() => {
                                                        const startTime = new Date(day);
                                                        startTime.setHours(hourValue);
                                                        startTime.setMinutes(quarter * 15);
                                                        onEventCreate(startTime);
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

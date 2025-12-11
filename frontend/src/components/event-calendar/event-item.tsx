import { format, getMinutes, isPast } from 'date-fns';
import { useMemo, useState } from 'react';

import type { CalendarEvent } from '@/components/event-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
    getBorderRadiusClasses,
    getEventColorClasses,

} from '@/components/event-calendar';
import { cn } from '@/lib/utils';

// 24-hour time; omit minutes when :00
function formatTimeWithOptionalMinutes(date: Date) {
    return format(date, getMinutes(date) === 0 ? 'HH' : 'HH:mm');
}

type EventWrapperProps = {
    event: CalendarEvent;
    isFirstDay?: boolean;
    isLastDay?: boolean;
    isDragging?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    children: React.ReactNode;
    currentTime?: Date;
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
};

// Shared wrapper component for event styling
function EventWrapper({
    event,
    isFirstDay = true,
    isLastDay = true,
    isDragging,
    onClick,
    className,
    children,
    currentTime,
    onMouseDown,
    onTouchStart,
}: EventWrapperProps) {
    // Always use the currentTime (if provided) to determine if the event is in the past
    // If no end is provided, use start as a fallback for display purposes
    const endOrStart = event.end ? new Date(event.end) : new Date(event.start);
    const displayEnd = currentTime ? new Date(new Date(currentTime).getTime() + (endOrStart.getTime() - new Date(event.start).getTime())) : endOrStart;

    const isEventInPast = isPast(displayEnd);

    return (
        <button
            type="button"
            className={cn(
                'focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2',
                getEventColorClasses(event.color),
                getBorderRadiusClasses(isFirstDay, isLastDay),
                className,
            )}
            data-dragging={isDragging || undefined}
            data-past-event={isEventInPast || undefined}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {children}
        </button>
    );
}

type EventItemProps = {
    event: CalendarEvent;
    view: 'month' | 'week' | 'day' | 'agenda';
    isDragging?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    showTime?: boolean;
    currentTime?: Date; // For updating time during drag
    isFirstDay?: boolean;
    isLastDay?: boolean;
    children?: React.ReactNode;
    className?: string;
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
};

export function EventItem({
    event,
    view,
    isDragging,
    onClick,
    // showTime,
    currentTime,
    isFirstDay = true,
    isLastDay = true,
    children,
    className,
    onMouseDown,
    onTouchStart,
}: EventItemProps) {
    const eventColor = event.color;

    // Use the provided currentTime (for dragging) or the event's actual time
    const displayStart = useMemo(() => {
        return currentTime || new Date(event.start);
    }, [currentTime, event.start]);

    const displayEnd = useMemo(() => {
        const endOrStart = event.end ? new Date(event.end) : new Date(event.start);
        return currentTime
            ? new Date(new Date(currentTime).getTime() + (endOrStart.getTime() - new Date(event.start).getTime()))
            : endOrStart;
    }, [currentTime, event.start, event.end]);

    // Calculate event duration in minutes
    // const durationMinutes = useMemo(() => {
    //     // If end is missing, assume a short 30-minute event for layout decisions
    //     const minutes = differenceInMinutes(displayEnd, displayStart);
    //     return Number.isFinite(minutes) && minutes >= 0 ? minutes : 30;
    // }, [displayStart, displayEnd]);

    // const getEventTime = () => {
    //     if (event.allDay)
    //         return 'All day';

    //     // For short events (less than 45 minutes), only show start time
    //     if (durationMinutes < 45) {
    //         return formatTimeWithOptionalMinutes(displayStart);
    //     }

    //     // For longer events, show both start and end time
    //     return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
    // };

    const [popoverOpen, setPopoverOpen] = useState(false);

    if (view === 'month') {
        return (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.(e);
                        }}
                    >
                        <EventWrapper
                            event={event}
                            isFirstDay={isFirstDay}
                            isLastDay={isLastDay}
                            isDragging={isDragging}
                            className={cn(
                                'mt-(--event-gap) h-(--event-height) items-center text-[10px] sm:text-xs',
                                popoverOpen && 'ring-2 ring-primary ring-offset-1',
                                className,
                            )}
                            currentTime={currentTime}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            {children || (
                                <span className="flex w-full min-w-0 items-center gap-1">
                                    <span className="min-w-0 flex-1 truncate">{event.title}</span>
                                    {!event.allDay && (
                                        <span className="shrink-0 font-normal opacity-70 text-[10px] sm:text-[11px]">
                                            {formatTimeWithOptionalMinutes(displayStart)}
                                        </span>
                                    )}
                                </span>
                            )}
                        </EventWrapper>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    side="bottom"
                    className="w-80 rounded-lg p-4"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col gap-2">
                        <div className="font-semibold text-lg">{event.title}</div>
                        <div className="text-sm opacity-70">
                            {event.allDay ? (
                                'All day'
                            ) : (
                                `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`
                            )}
                        </div>
                        {event.description && (
                            <div className="text-sm opacity-90">{event.description}</div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    if (view === 'week') {
        return (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.(e);
                        }}
                    >
                        <EventWrapper
                            event={event}
                            isFirstDay={isFirstDay}
                            isLastDay={isLastDay}
                            isDragging={isDragging}
                            className={cn(
                                'items-start justify-start text-[10px] sm:text-xs',
                                popoverOpen && 'ring-2 ring-primary ring-offset-1',
                                className,
                            )}
                            currentTime={currentTime}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            {children || (
                                <div className="flex min-h-0 w-full flex-col gap-0.5">
                                    <span className="line-clamp-2 wrap-break-word font-medium leading-tight">
                                        {event.title}
                                    </span>
                                    {!event.allDay && (
                                        <span className="shrink-0 text-[10px] opacity-70">
                                            {formatTimeWithOptionalMinutes(displayStart)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </EventWrapper>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    side="bottom"
                    className="w-80 rounded-lg p-4"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col gap-2">
                        <div className="font-semibold text-lg">{event.title}</div>
                        <div className="text-sm opacity-70">
                            {event.allDay ? (
                                'All day'
                            ) : (
                                `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`
                            )}
                        </div>
                        {event.description && (
                            <div className="text-sm opacity-90">{event.description}</div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    if (view === 'day') {
        return (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.(e);
                        }}
                    >
                        <EventWrapper
                            event={event}
                            isFirstDay={isFirstDay}
                            isLastDay={isLastDay}
                            isDragging={isDragging}
                            className={cn(
                                'items-start justify-start text-xs',
                                popoverOpen && 'ring-2 ring-primary ring-offset-1',
                                className,
                            )}
                            currentTime={currentTime}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            {children || (
                                <div className="flex min-h-0 w-full flex-col gap-0.5">
                                    <span className="line-clamp-2 wrap-break-word font-medium leading-tight">
                                        {event.title}
                                    </span>
                                    {!event.allDay && (
                                        <span className="shrink-0 text-[10px] opacity-70">
                                            {formatTimeWithOptionalMinutes(displayStart)} - {formatTimeWithOptionalMinutes(displayEnd)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </EventWrapper>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    side="bottom"
                    className="w-80 rounded-lg p-4"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col gap-2">
                        <div className="font-semibold text-lg">{event.title}</div>
                        <div className="text-sm opacity-70">
                            {event.allDay ? (
                                'All day'
                            ) : (
                                `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`
                            )}
                        </div>
                        {event.description && (
                            <div className="text-sm opacity-90">{event.description}</div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    // For agenda view, show a simple card layout
    return (
        <button
            type="button"
            className={cn(
                'focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-3 text-left transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-70',
                getEventColorClasses(eventColor),
                className,
            )}
            data-past-event={event.end ? isPast(new Date(event.end)) || undefined : undefined}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="flex-1 text-sm font-medium leading-tight">
                    {event.title}
                </span>
                {!event.allDay && (
                    <span className="shrink-0 text-xs opacity-70">
                        {formatTimeWithOptionalMinutes(displayStart)}
                        {event.end && ` - ${formatTimeWithOptionalMinutes(displayEnd)}`}
                    </span>
                )}
            </div>
            {event.description && (
                <div className="text-xs opacity-80 line-clamp-2">{event.description}</div>
            )}
        </button>
    );
}

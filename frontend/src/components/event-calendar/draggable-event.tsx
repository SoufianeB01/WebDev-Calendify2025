import { useRef } from 'react';

import type {
    CalendarEvent,
} from '@/components/event-calendar';

import { EventItem } from '@/components/event-calendar';

type DraggableEventProps = {
    'event': CalendarEvent;
    'view': 'month' | 'week' | 'day';
    'showTime'?: boolean;
    'onClick'?: (e: React.MouseEvent) => void;
    'height'?: number;
    'isMultiDay'?: boolean;
    'multiDayWidth'?: number;
    'isFirstDay'?: boolean;
    'isLastDay'?: boolean;
    'aria-hidden'?: boolean | 'true' | 'false';
};

export function DraggableEvent({
    event,
    view,
    showTime,
    onClick,
    height: _height,
    isMultiDay: _isMultiDay,
    multiDayWidth: _multiDayWidth,
    isFirstDay = true,
    isLastDay = true,
    'aria-hidden': ariaHidden,
}: DraggableEventProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={elementRef}
            className="touch-none"
        >
            <EventItem
                event={event}
                view={view}
                showTime={showTime}
                isFirstDay={isFirstDay}
                isLastDay={isLastDay}
                isDragging={false}
                onClick={onClick}
                aria-hidden={ariaHidden}
            />
        </div>
    );
}

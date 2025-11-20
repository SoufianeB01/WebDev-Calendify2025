import { format, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '../ui/button';
import type { CalendarEvent } from '@/components/event-calendar';

import { EventItem } from '@/components/event-calendar';

type EventsPopupProps = {
    date: Date;
    events: Array<CalendarEvent>;
    position: { top: number; left: number };
    onClose: () => void;
    onEventSelect: (event: CalendarEvent) => void;
};

export function EventsPopup({
    date,
    events,
    onClose,
    onEventSelect,
}: EventsPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close popup
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current
                && !popupRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const handleEventClick = (event: CalendarEvent) => {
        onEventSelect(event);
        onClose();
    };

    return (
        <div
            ref={popupRef}
            className="bg-background absolute z-50 max-h-96 w-80 overflow-auto rounded-md border shadow-lg"
        >
            <div className="bg-background sticky top-0 flex items-center justify-between border-b p-3">
                <h3 className="font-medium">{format(date, 'd MMMM yyyy', { locale: nl })}</h3>
                <Button
                    onClick={onClose}
                    className="hover:bg-muted rounded-full p-1"
                    aria-label="Close"
                >
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2 p-3">
                {events.length === 0
                    ? (
                        <div className="text-muted-foreground py-2 text-sm">No events</div>
                    )
                    : (
                        events.map((event) => {
                            const eventStart = new Date(event.start);
                            const eventEnd = new Date(event.end ?? event.start);
                            const isFirstDay = isSameDay(date, eventStart);
                            const isLastDay = isSameDay(date, eventEnd);

                            return (
                                <div
                                    key={event.id}
                                    className="cursor-pointer"
                                    onClick={() => handleEventClick(event)}
                                >
                                    <EventItem
                                        event={event}
                                        view="agenda"
                                        isFirstDay={isFirstDay}
                                        isLastDay={isLastDay}
                                    />
                                </div>
                            );
                        })
                    )}
            </div>
        </div>
    );
}

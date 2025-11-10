import { addDays, format, isToday } from 'date-fns';
import { enGB, nl } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    CalendarEvent,
} from '@/components/event-calendar';

import {
    AgendaDaysToShow,
    EventItem,
    getAgendaEventsForDay,
} from '@/components/event-calendar';

type AgendaViewProps = {
    currentDate: Date;
    events: Array<CalendarEvent>;
    onEventSelect: (event: CalendarEvent) => void;
};

export function AgendaView({
    currentDate,
    events,
    onEventSelect,
}: AgendaViewProps) {
    const { i18n, t } = useTranslation('dashboard');
    const dateFnsLocale = useMemo(() => {
        const lang = i18n.language || 'en-GB';
        if (lang.startsWith('nl'))
            return nl;
        return enGB;
    }, [i18n.language]);
    // Show events for the next days based on constant
    const days = useMemo(() => {
        return Array.from({ length: AgendaDaysToShow }, (_, i) =>
            addDays(new Date(currentDate), i));
    }, [currentDate]);

    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        onEventSelect(event);
    };

    // Check if there are any days with events
    const hasEvents = days.some(
        day => getAgendaEventsForDay(events, day).length > 0,
    );
    return (
        <div className="border-border/70 border-t px-4">
            {!hasEvents
                ? (
                    <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
                        <Calendar
                            size={32}
                            className="text-muted-foreground/50 mb-2"
                        />
                        <h3 className="text-lg font-medium">{t('dashboard.planning.message.noEventFound')}</h3>
                        <p className="text-muted-foreground">
                            {t('dashboard.planning.message.noEventFoundSubtitle')}
                        </p>
                    </div>
                )
                : (
                    days.map((day) => {
                        const dayEvents = getAgendaEventsForDay(events, day);

                        if (dayEvents.length === 0)
                            return null;

                        return (
                            <div
                                key={day.toString()}
                                className="border-border/70 relative my-12 border-t"
                            >
                                <span
                                    className="bg-background absolute -top-3 left-0 flex h-6 items-center pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
                                    data-today={isToday(day) || undefined}
                                >
                                    {format(day, 'd MMM, EEEE', { locale: dateFnsLocale })}
                                </span>
                                <div className="mt-6 space-y-2">
                                    {dayEvents.map(event => (
                                        <EventItem
                                            key={event.id}
                                            event={event}
                                            view="agenda"
                                            onClick={e => handleEventClick(event, e)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
        </div>
    );
}

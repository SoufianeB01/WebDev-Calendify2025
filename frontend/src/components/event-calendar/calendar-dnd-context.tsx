import { createContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import type { CalendarEvent } from '@/components/event-calendar';

// Minimal no-op context so the rest of the calendar keeps working without DnD
type CalendarDndContextType = {
    activeEvent: CalendarEvent | null;
    activeId: string | null;
    activeView: 'month' | 'week' | 'day' | null;
    currentTime: Date | null;
    eventHeight: number | null;
    isMultiDay: boolean;
    multiDayWidth: number | null;
    dragHandlePosition: {
        x?: number;
        y?: number;
        data?: {
            isFirstDay?: boolean;
            isLastDay?: boolean;
        };
    } | null;
};

const defaultDndValue: CalendarDndContextType = {
    activeEvent: null,
    activeId: null,
    activeView: null,
    currentTime: null,
    eventHeight: null,
    isMultiDay: false,
    multiDayWidth: null,
    dragHandlePosition: null,
};

const CalendarDndContext = createContext<CalendarDndContextType>(defaultDndValue);

type CalendarDndProviderProps = {
    children: ReactNode;
    onEventUpdate?: (event: CalendarEvent) => void;
};

export function CalendarDndProvider({ children }: CalendarDndProviderProps) {
    // memoize default to avoid triggering subtree renders
    const value = useMemo(() => defaultDndValue, []);
    return <CalendarDndContext value={value}>{children}</CalendarDndContext>;
}

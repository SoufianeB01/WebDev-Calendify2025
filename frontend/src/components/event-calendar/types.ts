export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type CalendarEvent = {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end?: Date;
    allDay?: boolean;
    color?: EventColor;
};

export type EventColor
    = | 'sky'
    | 'amber'
    | 'violet'
    | 'rose'
    | 'emerald'
    | 'orange'
    | 'utility-gray';

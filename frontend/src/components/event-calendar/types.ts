export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type CalendarEvent = {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end?: Date;
    allDay?: boolean;
    color?: EventColor;
    averageRating?: number;
    reviewCount?: number;
};

export type EventColor
    = | 'sky'
    | 'amber'
    | 'violet'
    | 'rose'
    | 'emerald'
    | 'orange'
    | 'utility-gray';

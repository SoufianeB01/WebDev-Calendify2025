export interface Event {
    eventId: number;
    title: string;
    description: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
    createdBy: number;
    adminApproval: boolean;
    createdAt: string;
    updatedAt: string;
    participants: Record<string, string>;
    isRegistered?: boolean;
    rating?: number;
    averageRating?: number;
}

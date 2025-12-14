import type { Event } from "@/types/Event";
import type { OfficeAttendance } from "@/types/OfficeAttendance";
import type { Room } from "@/types/Room";
import type { RoomBooking } from "@/types/RoomBooking";
import type { User } from "@/types/User";
import type { UserProfile } from "@/types/UserProfile";
import type { EventParticipation } from "@/types/EventParticipation";

export interface MockData {
    users: Array<User>;
    events: Array<Event>;
    reviews: Array<{
        reviewId: number;
        eventId: number;
        userId: number;
        userName: string;
        rating: number;
        comment: string;
        date: string;
    }>;
    attendees: Array<{
        eventId: number;
        userId: number;
        userName: string;
        email: string;
    }>;
    rooms: Array<Room>;
    roomBookings: Array<RoomBooking>;
    officeAttendance: Array<OfficeAttendance>;
    userProfile: UserProfile;
    eventParticipation: Array<EventParticipation>;
}

declare const mockData: MockData;
export default mockData;

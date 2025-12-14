export interface Room {
    roomId: number;
    roomName: string;
    capacity: number;
    location: string;
    services: Array<string>;
    isOnline: boolean;
    createdAt: string;
    updatedAt: string;
}

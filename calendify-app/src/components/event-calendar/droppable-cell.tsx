import { cn } from '@/lib/utils';

type DroppableCellProps = {
    id: string;
    date: Date;
    time?: number; // For week/day views, represents hours (e.g., 9.25 for 9:15)
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
};

export function DroppableCell({
    id: _id,
    date: _date,
    time,
    children,
    className,
    onClick,
}: DroppableCellProps) {
    // Format time for display in tooltip (only for debugging)
    const formattedTime
        = time !== undefined
            ? `${Math.floor(time)}:${Math.round((time - Math.floor(time)) * 60)
                .toString()
                .padStart(2, '0')}`
            : null;

    return (
        <div
            onClick={onClick}
            className={cn(
                'data-dragging:bg-accent flex h-full flex-col overflow-hidden px-0.5 py-1 sm:px-1',
                className,
            )}
            title={formattedTime ? `${formattedTime}` : undefined}
        >
            {children}
        </div>
    );
}

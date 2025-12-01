import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './ui/table';
import type { Cell, ColumnDef, Row, SortingState } from '@tanstack/react-table';

import type { CalendarEvent } from '@/components/event-calendar';

import {
    EventCalendar,

} from '@/components/event-calendar';
import { cn } from '@/lib/utils';

export type CalendarTableProps<TData, TValue> = {
    columns: Array<ColumnDef<TData, TValue>>;
    className?: string;
    data: Array<TData>;
    pageSize?: number;
    cellProps?: (cell: Cell<TData, TValue>) => React.HTMLAttributes<HTMLTableCellElement> & { ref?: React.RefObject<HTMLTableCellElement | null> };
    rowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement> & { ref?: React.RefObject<HTMLTableRowElement | null> };
};

export function CalendarTableRoot<TData, TValue>({
    className,
    columns,
    data,
}: CalendarTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className={cn('rounded-2xl border mb-10 overflow-hidden', className)}>
            <Table className={cn('overflow-hidden', className)}>
                <TableHeader className="bg-background-secondary">
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef
                                                    .header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>

                </TableBody>
            </Table>
        </div>
    );
}


export function CalendarTableHeader() {
    const projects: Array<CalendarEvent> = [
        {
            id: '7',
            title: 'Sales Conference',
            description: 'Discuss about new clients',
            start: new Date(),
            end: new Date(new Date().getTime() + 15 * 60000),
            color: 'rose',
        },
    ];

    const [events, setEvents] = useState<Array<CalendarEvent>>(projects);

    const handleEventAdd = (event: CalendarEvent) => {
        setEvents([...events, event]);
    };

    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        setEvents(
            events.map(event =>
                event.id === updatedEvent.id ? updatedEvent : event,
            ),
        );
    };

    return (
        <>
            <EventCalendar
                events={projects}
                onEventAdd={handleEventAdd}
                onEventUpdate={handleEventUpdate}
            />
        </>
    );
};

export const CalendarTable = Object.assign(CalendarTableRoot, {
    Header: CalendarTableHeader,
});

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  header: string | React.ReactNode;
  accessorKey: string;
  cell?: (info: { getValue: () => any; row: any }) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  className?: string;
}

export function DataTable({ columns, data, className }: DataTableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-[1rem] border border-border/50 ${className}`}>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-border/50">
            {columns.map((column) => (
              <TableHead 
                key={column.accessorKey} 
                className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 overflow-visible py-5 h-14 border-b border-slate-200"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground font-medium italic">
                No data available.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="group hover:bg-muted/30 border-border/30 transition-colors">
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.accessorKey}`} className="py-6 px-4 text-sm align-middle h-20">
                    {column.cell 
                      ? column.cell({ getValue: () => row[column.accessorKey], row })
                      : row[column.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
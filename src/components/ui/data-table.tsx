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
    <div className={`w-full overflow-x-auto ${className}`}>
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100/50">
            {columns.map((column) => (
              <TableHead 
                key={column.accessorKey} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-4 h-12"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 font-medium italic">
                Registry currently void of data entries.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="group hover:bg-slate-50/30 border-slate-50/50 transition-colors">
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.accessorKey}`} className="py-4 text-sm">
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
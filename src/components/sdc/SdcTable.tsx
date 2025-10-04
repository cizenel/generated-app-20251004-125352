import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SdcRecord, DefinitionType } from "@shared/types";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/store/authStore";
import { useDefinitionStore } from "@/store/definitionStore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
type SdcTableProps = {
  data: SdcRecord[];
  onAddRecord: () => void;
  onEditRecord: (record: SdcRecord) => void;
  onDeleteRecord: (record: SdcRecord) => void;
};
export function SdcTable({ data, onAddRecord, onEditRecord, onDeleteRecord }: SdcTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const currentUser = useAuthStore(state => state.user);
  const { definitions, fetchDefinitions } = useDefinitionStore();
  React.useEffect(() => {
    const definitionTypes: DefinitionType[] = ['Sponsor', 'Center', 'Investigator', 'ProjectCode'];
    definitionTypes.forEach(type => {
      if (!definitions[type] || definitions[type].length === 0) {
        fetchDefinitions(type);
      }
    });
  }, [fetchDefinitions, definitions]);
  const getNameById = React.useCallback((type: DefinitionType, id: string) => {
    return definitions[type]?.find(def => def.id === id)?.name || id;
  }, [definitions]);
  const columns: ColumnDef<SdcRecord>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<SdcRecord>[] = [
      { accessorKey: "date", header: t.date },
      { accessorKey: "sponsorId", header: t.Sponsor, cell: ({ row }) => getNameById('Sponsor', row.getValue("sponsorId")) },
      { accessorKey: "centerId", header: t.Center, cell: ({ row }) => getNameById('Center', row.getValue("centerId")) },
      { accessorKey: "investigatorId", header: t.Investigator, cell: ({ row }) => getNameById('Investigator', row.getValue("investigatorId")) },
      { accessorKey: "projectCodeId", header: t.ProjectCode, cell: ({ row }) => getNameById('ProjectCode', row.getValue("projectCodeId")) },
      { accessorKey: "patientCode", header: t.patientCode },
    ];
    if (currentUser?.role === 'L2' || currentUser?.role === 'L3') {
      baseColumns.push({
        accessorKey: "creatorUsername",
        header: t.creator,
        cell: ({ row }) => row.original.creatorUsername || 'N/A',
      });
    }
    baseColumns.push({
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        const canModify = currentUser?.role === 'L2' || currentUser?.role === 'L3' || currentUser?.id === record.creatorId;
        if (!canModify) return null;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEditRecord(record)}>{t.edit}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteRecord(record)} className="text-red-600">{t.delete}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
    return baseColumns;
  }, [currentUser, getNameById, onEditRecord, onDeleteRecord]);
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });
  const getExportData = () => {
    return table.getFilteredRowModel().rows.map(row => {
      const rowData: { [key: string]: any } = {
        [t.date]: row.original.date,
        [t.Sponsor]: getNameById('Sponsor', row.original.sponsorId),
        [t.Center]: getNameById('Center', row.original.centerId),
        [t.Investigator]: getNameById('Investigator', row.original.investigatorId),
        [t.ProjectCode]: getNameById('ProjectCode', row.original.projectCodeId),
        [t.patientCode]: row.original.patientCode,
      };
      if (currentUser?.role === 'L2' || currentUser?.role === 'L3') {
        rowData[t.creator] = row.original.creatorUsername || 'N/A';
      }
      return rowData;
    });
  };
  const exportToExcel = () => {
    const tableData = getExportData();
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SDC_Kayitlari");
    XLSX.writeFile(wb, "sdc_kayit_listesi.xlsx");
  };
  const exportToPdf = () => {
    const doc = new jsPDF();
    const tableData = getExportData();
    const headers = Object.keys(tableData[0] || {});
    const body = tableData.map(row => Object.values(row));
    (doc as any).autoTable({ head: [headers], body });
    doc.save("sdc_kayit_listesi.pdf");
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-2">
        <Input
          placeholder={t.filterByPatientCode}
          value={(table.getColumn("patientCode")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("patientCode")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> {t.export}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToExcel}>{t.exportExcel}</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPdf}>{t.exportPdf}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onAddRecord}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t.addNewSdcRecord}
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">{t.noResults}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{t.previous}</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{t.next}</Button>
      </div>
    </div>
  );
}
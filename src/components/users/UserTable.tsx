import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
  DropdownMenuSeparator,
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
import { Badge } from "@/components/ui/badge";
import { AuthUser, UserRole } from "@shared/types";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/store/authStore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
type UserTableProps = {
  data: AuthUser[];
  onAddUser: () => void;
  onEditUser: (user: AuthUser) => void;
  onDeleteUser: (user: AuthUser) => void;
};
export function UserTable({ data, onAddUser, onEditUser, onDeleteUser }: UserTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const currentUser = useAuthStore(state => state.user);
  const columns: ColumnDef<AuthUser>[] = [
    {
      accessorKey: "username",
      header: t.username,
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "role",
      header: t.role,
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return <Badge variant="outline">{t[role]}</Badge>;
      },
    },
    {
      accessorKey: "isActive",
      header: t.userStatus,
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return <Badge variant={isActive ? "default" : "destructive"}>{isActive ? t.active : t.inactive}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const isSuperAdminTarget = user.role === 'L3';
        if (currentUser?.role === 'L2' && isSuperAdminTarget) {
          return null;
        }
        const canDelete = !isSuperAdminTarget;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEditUser(user)}>
                {t.edit}
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem onClick={() => onDeleteUser(user)} className="text-red-600">
                  {t.delete}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  const exportToExcel = () => {
    const tableData = table.getFilteredRowModel().rows.map(row => ({
      [t.username]: row.original.username,
      [t.role]: t[row.original.role],
      [t.userStatus]: row.original.isActive ? t.active : t.inactive,
    }));
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "kullanici_listesi.xlsx");
  };
  const exportToPdf = () => {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [[t.username, t.role, t.userStatus]],
      body: table.getFilteredRowModel().rows.map(row => [
        row.original.username,
        t[row.original.role],
        row.original.isActive ? t.active : t.inactive,
      ]),
    });
    doc.save("kullanici_listesi.pdf");
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-2">
        <Input
          placeholder={t.filterByUsername}
          value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
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
          <Button onClick={onAddUser}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t.addNewUser}
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t.next}
        </Button>
      </div>
    </div>
  );
}
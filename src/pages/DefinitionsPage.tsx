import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefinitionStore } from "@/store/definitionStore";
import { useAuthStore } from "@/store/authStore";
import { Definition, DefinitionType } from "@shared/types";
import { t } from "@/lib/i18n";
import { DefinitionForm, DefinitionFormValues } from "@/components/definitions/DefinitionForm";
import { DeleteDefinitionDialog } from "@/components/definitions/DeleteDefinitionDialog";
const validDefinitionTypes: DefinitionType[] = ['Sponsor', 'Center', 'Investigator', 'ProjectCode', 'WorkDone'];
export function DefinitionsPage() {
  const { definitionType } = useParams<{ definitionType: string }>();
  const navigate = useNavigate();
  const { definitions, fetchDefinitions, addDefinition, updateDefinition, deleteDefinition, isLoading } = useDefinitionStore();
  const { user } = useAuthStore();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<Definition | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const type = useMemo(() => {
    if (definitionType && validDefinitionTypes.includes(definitionType as DefinitionType)) {
      return definitionType as DefinitionType;
    }
    return null;
  }, [definitionType]);
  useEffect(() => {
    if (!type) {
      navigate('/'); // Redirect if type is invalid
    } else {
      fetchDefinitions(type);
    }
  }, [type, fetchDefinitions, navigate]);
  const data = useMemo(() => (type ? definitions[type] : []), [definitions, type]);
  const pageTitle = type ? t[type] : t.definitions;
  const isAdmin = user?.role === 'L2' || user?.role === 'L3';
  const columns: ColumnDef<Definition>[] = [
    {
      accessorKey: "name",
      header: t.name,
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    ...(isAdmin ? [{
      id: "actions",
      cell: ({ row }: { row: { original: Definition }}) => {
        const definition = row.original;
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
                <DropdownMenuItem onClick={() => handleOpenForm(definition)}>{t.edit}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenDeleteConfirm(definition)} className="text-red-600">{t.delete}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }] : []),
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
    state: { sorting, columnFilters },
  });
  const handleOpenForm = (definition: Definition | null = null) => {
    setSelectedDefinition(definition);
    setFormOpen(true);
  };
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedDefinition(null);
  };
  const handleOpenDeleteConfirm = (definition: Definition) => {
    setSelectedDefinition(definition);
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedDefinition(null);
  };
  const handleFormSubmit = async (values: DefinitionFormValues) => {
    if (!type) return;
    if (selectedDefinition) {
      await updateDefinition(type, selectedDefinition.id, values);
    } else {
      await addDefinition(type, values);
    }
    handleCloseForm();
  };
  const handleDeleteConfirm = async () => {
    if (selectedDefinition && type) {
      await deleteDefinition(type, selectedDefinition.id);
    }
    handleCloseDeleteConfirm();
  };
  if (!type) {
    return null; // Or a loading/error state while redirecting
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
        {isAdmin && (
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t.addNewDefinition(pageTitle)}
          </Button>
        )}
      </div>
      {isLoading && data.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder={t.filterByName}
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
      )}
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedDefinition ? t.editDefinition(pageTitle) : t.addNewDefinition(pageTitle)}</DialogTitle>
            <DialogDescription>{t.definitionFormDescription(pageTitle)}</DialogDescription>
          </DialogHeader>
          <DefinitionForm
            definition={selectedDefinition}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            definitionType={pageTitle}
          />
        </DialogContent>
      </Dialog>
      <DeleteDefinitionDialog
        definition={selectedDefinition}
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        definitionType={pageTitle}
      />
    </div>
  );
}
"use client";

import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Checkbox } from "@ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Badge } from "@ui/badge";
import { Skeleton } from "@ui/skeleton";
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  Settings2,
  Filter,
  X,
  CircleArrowDown,
  CircleArrowUp,
  ArrowRightLeft,
  RefreshCw,
  Clock,
  AlertCircle,
  FileX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useCategories } from "@/hooks/use-categories";
import { DeleteDialog } from "@common/delete-dialog";
import { useFormatter } from "@/hooks/use-formatter";

import type { Transaction } from "@/types/transaction";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: Error | null;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionIds: string[]) => Promise<void>;
  onView?: (transaction: Transaction) => void;
  accountId?: string | null;
  className?: string;
  // Server-driven pagination (optional). When provided, the table will operate in manual pagination mode
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (pageIndex: number, pageSize?: number) => void;
}

const TRANSACTION_TYPE_CONFIG = {
  DEBIT: {
    label: "Expense",
    icon: CircleArrowDown,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  CREDIT: {
    label: "Income",
    icon: CircleArrowUp,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  TRANSFER: {
    label: "Transfer",
    icon: ArrowRightLeft,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
} as const;

const PAYMENT_METHOD_MAP: Record<string, string> = {
  CARD: "Card",
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  AUTO_DEBIT: "Auto Debit",
  UPI: "UPI",
  OTHER: "Other",
};

// Transaction type badge component
function TransactionTypeBadge({ type }: { type: Transaction["type"] }) {
  const { label, icon: Icon, className } = TRANSACTION_TYPE_CONFIG[type];

  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Amount formatter hook-based wrapper is handled inside the component
// We will remove the static functions and use the hook inside TransactionsTable

// Empty state component
function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="bg-muted/50 mb-4 rounded-full p-4">
        <FileX className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No transactions found</h3>
      <p className="text-muted-foreground mb-4 max-w-sm text-center">
        {hasFilters
          ? "No transactions match your current filters. Try adjusting your search criteria."
          : "Get started by creating your first transaction."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

// Error state component
function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="bg-destructive/10 mb-4 rounded-full p-4">
        <AlertCircle className="text-destructive h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Something went wrong</h3>
      <p className="text-muted-foreground mb-4 max-w-sm text-center">
        {error.message || "Failed to load transactions. Please try again."}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// Skeleton loader
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TransactionsTable({
  transactions,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
  onView,
  accountId: _accountId,
  className,
  pageIndex,
  pageSize,
  totalCount,
  onPageChange,
}: TransactionsTableProps) {
  const { formatAmount, formatDate } = useFormatter();
  const { categoryMap } = useCategories();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);

  // Debounced search
  const debouncedSearch = useDebounce(globalFilter, 300);

  // Define columns
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-ml-3"
            >
              Date Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-muted-foreground text-sm">
            {formatDate(row.getValue("createdAt"))}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Title",
        cell: ({ row }) => {
          return (
            <div className="max-w-[200px]">
              <div className="truncate font-medium">
                {row.original.description ?? "Untitled Transaction"}
              </div>
              {row.original.notes && (
                <div className="text-muted-foreground mt-0.5 truncate text-xs">
                  {row.original.notes}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "categoryId",
        header: "Category",
        cell: ({ row }) => {
          const categoryId = row.original.categoryId;

          if (!categoryId) {
            return (
              <div className="text-sm">
                <span className="text-muted-foreground">Uncategorized</span>
              </div>
            );
          }

          // Find category name from the map for O(1) lookup
          const categoryName = categoryMap.get(categoryId);

          return (
            <div className="text-sm">
              {categoryName ? (
                <Badge variant="secondary" className="font-normal">
                  {categoryName}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground font-normal"
                >
                  Unknown
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <TransactionTypeBadge type={row.getValue("type")} />,
        filterFn: (row, id, value) => {
          if (value === "all") return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-ml-3"
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const type = row.original.type;
          const amount = formatAmount(row.getValue("amount"));
          const colorClass =
            type === "CREDIT"
              ? "text-green-600 font-semibold"
              : type === "DEBIT"
                ? "text-red-600 font-semibold"
                : "text-blue-600 font-semibold";

          return (
            <span className={colorClass}>
              {type === "CREDIT" ? "+" : "-"}
              {amount}
            </span>
          );
        },
      },
      {
        accessorKey: "date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-ml-3"
            >
              Transaction Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm">{formatDate(row.getValue("date"))}</div>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }) => {
          const paymentMethod = row.getValue("paymentMethod");

          if (!paymentMethod) {
            return <span className="text-muted-foreground text-sm">-</span>;
          }

          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const pm = String(paymentMethod);
          return (
            <span className="text-sm">{PAYMENT_METHOD_MAP[pm] ?? pm}</span>
          );
        },
      },
      {
        accessorKey: "isRecurring",
        header: "Frequency",
        cell: ({ row }) => {
          const isRecurring = row.getValue("isRecurring");
          const recurringRule = row.original.recurringRule;

          return (
            <div className="flex items-center gap-1.5 text-sm">
              {isRecurring ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="text-muted-foreground capitalize">
                      {recurringRule?.frequency?.toLowerCase() ?? "Recurring"}
                    </span>
                  </div>
                  {recurringRule?.nextRunAt && (
                    <span className="text-muted-foreground pl-5 text-xs">
                      Next: {formatDate(recurringRule.nextRunAt)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                  <span className="text-muted-foreground">One-time</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const transaction = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted h-8 w-8 p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onView && (
                  <DropdownMenuItem onClick={() => onView(transaction)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(transaction)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    setItemsToDelete([transaction.id]);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onView, categoryMap, formatAmount, formatDate],
  );

  // Filter transactions by type
  const filteredData = useMemo(() => {
    if (typeFilter === "all") return transactions;
    return transactions.filter((t) => t.type === typeFilter);
  }, [transactions, typeFilter]);

  const [localPageIndex, setLocalPageIndex] = useState<number>(pageIndex ?? 0);
  const [localPageSize, setLocalPageSize] = useState<number>(pageSize ?? 20);

  React.useEffect(() => {
    if (typeof pageIndex === "number") setLocalPageIndex(pageIndex);
  }, [pageIndex]);

  React.useEffect(() => {
    if (typeof pageSize === "number") setLocalPageSize(pageSize);
  }, [pageSize]);

  const serverPageCount =
    typeof totalCount === "number" && localPageSize > 0
      ? Math.ceil(totalCount / localPageSize)
      : undefined;

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: debouncedSearch,
      pagination: { pageIndex: localPageIndex, pageSize: localPageSize },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: localPageIndex, pageSize: localPageSize })
          : updater;
      setLocalPageIndex(next.pageIndex);
      setLocalPageSize(next.pageSize);
      onPageChange?.(next.pageIndex, next.pageSize);
    },
    manualPagination: typeof totalCount === "number",
    pageCount: serverPageCount,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const description = (row.original.description ?? "").toLowerCase();
      const notes = (row.original.notes ?? "").toLowerCase();
      const amount = row.original.amount.toString();
      return (
        description.includes(search) ||
        notes.includes(search) ||
        amount.includes(search)
      );
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasFilters = globalFilter !== "" || typeFilter !== "all";

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!onDelete || itemsToDelete.length === 0) return;
    await onDelete(itemsToDelete);
    setRowSelection({});
    setItemsToDelete([]);
  };

  const clearFilters = () => {
    setGlobalFilter("");
    setTypeFilter("all");
    setColumnFilters([]);
  };

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-[300px]">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search transactions..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="DEBIT">Expense</SelectItem>
            <SelectItem value="CREDIT">Income</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          {/* Bulk actions */}
          {selectedRows.length > 0 && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setItemsToDelete(selectedRows.map((row) => row.original.id));
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedRows.length})
            </Button>
          )}

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <TableSkeleton />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[400px] p-0">
                  <EmptyState
                    hasFilters={hasFilters}
                    onClearFilters={clearFilters}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-muted-foreground text-sm">
          {selectedRows.length > 0 && (
            <span className="mr-4">
              {selectedRows.length} of {table.getFilteredRowModel().rows.length}{" "}
              row(s) selected
            </span>
          )}
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-9 w-[100px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Are you sure?"
        description={`This will permanently delete ${itemsToDelete.length} transaction(s). This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        successMessage={`${itemsToDelete.length} transaction(s) deleted successfully`}
        errorMessage="Failed to delete transactions"
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as arrow from "@apache-arrow/ts";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface DataTableProps {
  queryResult: arrow.Table | null;
}
const getData = (
  batch: number,
  queryResult: arrow.Table
): { [x: string]: unknown }[] => {
  return (
    queryResult?.batches
      ?.at(batch)
      ?.toArray()
      ?.map((r) => r.toJSON()) ?? []
  );
};

const Table = ({ queryResult }: { queryResult: arrow.Table }) => {
  const columnNames = getColumnNames(queryResult);
  const pageCount = queryResult?.batches.length ?? 0;
  const columnHelper = createColumnHelper<unknown>();

  const columns = columnNames.map((name) => columnHelper.accessor(name, {}));

  const [data, setData] = useState(getData(0, queryResult));

  const debouncedoOnPageChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const page = e.target.value ? Number(e.target.value) - 1 : 0;
      const clampedPage = Math.min(Math.max(0, page), pageCount - 1);
      setPage(clampedPage);
    },
    500
  );

  useEffect(() => {
    setData(getData(0, queryResult));
  }, [queryResult]);

  const table = useReactTable<unknown>({
    data,
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    pageCount,
  });

  const setPage = (idx: number) => {
    setData(getData(idx, queryResult));
    table.setPageIndex(idx);
  };

  const currentPage = table.getState().pagination.pageIndex;
  // Handle case where user reduces size of query set whilst we've loaded a greater number of pages
  if (currentPage > pageCount) {
    setPage(pageCount - 1);
  }

  return (
    <>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </Button>
        <Button
          className="rounded p-1"
          variant="outline"
          onClick={() => setPage(currentPage - 1)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </Button>
        <Button
          variant="outline"
          className="rounded p-1"
          onClick={() => setPage(currentPage + 1)}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </Button>
        <Button
          className="rounded p-1"
          variant="outline"
          onClick={() => setPage(pageCount - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </Button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {currentPage + 1} of {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <Input
            min={1}
            max={table.getPageCount()}
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={debouncedoOnPageChange}
            className="border p-1 rounded w-16"
          />
        </span>
      </div>

      <div className="p-2 block max-w-full overflow-x-scroll overflow-y-hidden">
        <div className="h-2" />
        <table className="w-full ">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="border-2 p-2"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id} className="border-2 p-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const getColumnNames = (queryResult: arrow.Table | null) => {
  if (!queryResult) {
    return [];
  }
  return queryResult.schema.fields.map((field) => {
    console.log(`${field.type}: ${field.typeId}`);
    return field.name;
  });
};

export const DataTable = ({ queryResult }: DataTableProps) => {
  if (!queryResult) {
    return <Fragment>Nada to see 👀</Fragment>;
  }

  return (
    <div>
      <Table queryResult={queryResult} />
    </div>
  );
};

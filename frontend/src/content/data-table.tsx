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
  const columnInfo = getColumnInfo(queryResult);
  const pageCount = queryResult?.batches.length ?? 0;
  const columnHelper = createColumnHelper<unknown>();

  const columns = columnInfo.map(({ name, renderFn }) =>
    columnHelper.accessor(name, { cell: (v) => renderFn(v.getValue()) })
  );
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

type RenderFn = (v: unknown) => string | number;

const requiresSpecialRenderFn = (field: arrow.Field<any>) => {};

const SCALAR_TYPES = [
  arrow.Type.Int,
  arrow.Type.Float,
  arrow.Type.Binary,
  arrow.Type.Utf8,
  arrow.Type.Bool,
  arrow.Type.Decimal,
  arrow.Type.FixedSizeBinary,
  arrow.Type.Date,
  arrow.Type.Time,
  arrow.Type.Timestamp,
  arrow.Type.Interval,
  arrow.Type.FixedSizeBinary,
];
const NULL_TYPES = [arrow.Type.NONE, arrow.Type.Null];
const COMPLEX_TYPES = [
  arrow.Type.List,
  arrow.Type.Struct,
  arrow.Type.Union,
  arrow.Type.FixedSizeList,
  arrow.Type.Map,
];

type ScalarType =
  | arrow.Field<arrow.Int>
  | arrow.Field<arrow.Float>
  | arrow.Field<arrow.Binary>
  | arrow.Field<arrow.Utf8>
  | arrow.Field<arrow.Bool>
  | arrow.Field<arrow.Decimal>
  | arrow.Field<arrow.FixedSizeBinary>
  | arrow.Field<arrow.Date_>
  | arrow.Field<arrow.Time>
  | arrow.Field<arrow.Timestamp>
  | arrow.Field<arrow.Interval>
  | arrow.Field<arrow.FixedSizeBinary>;

const isScalar = (field: arrow.Field<any>): field is ScalarType => {
  return SCALAR_TYPES.includes(field.typeId);
};
const isNull = (field: arrow.Field<any>) => {
  return arrow.DataType.isNull(field);
};

const isComplex = (field: arrow.Field<any>) => {
  return COMPLEX_TYPES.includes(field.typeId);
};

const passThroughFn: RenderFn = (v: unknown) => v;

const getRenderDateFn = (field: arrow.Date_<any>) => {
  return passThroughFn;
};

const validationFunctions = {
  int: arrow.DataType.isInt,
  float: arrow.DataType.isFloat,
  binary: arrow.DataType.isBinary,
  bool: arrow.DataType.isBool,
  decimal: arrow.DataType.isDecimal,
  "dense union": arrow.DataType.isDenseUnion,
  dict: arrow.DataType.isDictionary,
  "fixed binary": arrow.DataType.isFixedSizeBinary,
  "fixed list": arrow.DataType.isFixedSizeList,
  interval: arrow.DataType.isInterval,
  list: arrow.DataType.isList,
  map: arrow.DataType.isMap,
  isNull: arrow.DataType.isNull,
  sparseUnion: arrow.DataType.isSparseUnion,
  struct: arrow.DataType.isStruct,
  time: arrow.DataType.isTime,
  timestamp: arrow.DataType.isTimestamp,
  union: arrow.DataType.isUnion,
  utf8: arrow.DataType.isUtf8,
};

const getScalarRenderFn = (field: ScalarType): RenderFn => {
  if (arrow.DataType.isDate(field)) {
    return getRenderDateFn(field);
  }
  if (arrow.DataType.isTimestamp(field)) {
    return (v) => new Date(v).toISOString();
  }
  if (field.name === "foo") {
    console.log(field);
    Object.entries(validationFunctions).forEach(([name, fn]) => {
      if (fn(field)) {
        console.log(`${name} for ${field.name} = ${fn(field)}`);
      }
    });
  }

  return passThroughFn;
};

const getRenderFn = (field: arrow.Field<any>): RenderFn => {
  if (isScalar(field)) {
    return getScalarRenderFn(field);
  }

  return passThroughFn;
};

const getColumnInfo = (queryResult: arrow.Table | null) => {
  return (
    queryResult?.schema?.fields?.map((field) => {
      const { name, typeId, type } = field;
      const renderFn = getRenderFn(field);

      // if (typeId === arrow.Type.Timestamp) {
      //   // console.log(type);
      // }
      return { name, typeId, renderFn };
    }) ?? []
  );
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

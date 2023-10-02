import * as arrow from "@apache-arrow/ts";
import { FunctionComponent, Fragment } from "react";

export interface DataTableProps {
  queryResult: arrow.Table | null;
}

const getColumnNames = (queryResult: arrow.Table | null) => {
  if (!queryResult) {
    return [];
  }
  return queryResult.schema.fields.map((field) => {
    console.log(`${field.type}: ${field.typeId}`);
    return field.name;
  });
};

export const DataTable: FunctionComponent<DataTableProps> = ({
  queryResult,
}) => {
  if (!queryResult) {
    return <Fragment>Nada to see 👀</Fragment>;
  }

  const columnNames = getColumnNames(queryResult);
  // TODO: Add pagination options
  const currentBatch = queryResult.batches.at(0)?.toArray();
  const tableHeader = columnNames.map((name) => {
    return (
      <th className="border dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">
        {name}
      </th>
    );
  });

  const tableData = currentBatch?.map((row) => {
    // console.log(row.toJSON());
    return (
      <tr>
        {columnNames.map((columnName, idx) => {
          return (
            <td
              className="border border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400"
              key={`${columnName}-${idx}`}
            >
              {row[columnName] ?? ""}
            </td>
          );
        })}
      </tr>
    );
  });

  return (
    <div>
      <table className="border-collapse table-auto w-full text-sm">
        <thead>
          <tr>{tableHeader}</tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800">{tableData}</tbody>
      </table>
    </div>
  );
};

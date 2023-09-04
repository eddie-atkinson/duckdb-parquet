import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { ChangeEvent, useRef, useState } from "preact/compat";
import * as arrow from "@apache-arrow/ts";
import { useDBConnection } from "./hooks/useDBConnection";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

export const Content = () => {
  const { db, loading, connection } = useDBConnection();
  const [queryData, setQueryData] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<arrow.Table | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  if (loading) {
    return <div>Waiting for DB to initialise</div>;
  }

  const fileChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (!files || !files?.[0]?.name?.endsWith(".parquet")) {
      return;
    }
    const [file] = files;

    await db.registerFileHandle(
      file.name,
      file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true
    );

    await connection.query(`DROP TABLE IF EXISTS data;`);
    await connection.query(
      `CREATE TABLE data AS SELECT * FROM read_parquet('${file.name}');`
    );
  };

  const queryRef = useRef<null | HTMLInputElement>(null);

  const onQuery = async (e: ChangeEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    const queryString = queryRef.current?.value ?? "";
    console.log(queryString);

    const result = await connection.query(queryString);
    setQueryResult(result);
  };

  const nPages = queryResult?.batches.length;
  const nRows = queryResult?.numRows;

  const writer = new arrow.RecordBatchWriter();
  writer.write();
  console.log(queryResult);

  return (
    <div className="flex flex-col p-10 gap-2">
      <form onSubmit={onQuery}>
        <div className="flex justify-center space-x-2">
          <Input type="text" name="query" className="input" ref={queryRef} />
          <Button type="submit">Query</Button>
          <Button onClick={() => {}}>Download</Button>
        </div>
      </form>
      <Input
        className="max-w-sm"
        type="file"
        accept=".parquet"
        onChange={fileChangeHandler}
      />
      <div>
        N pages of results: {nPages} <hr /> N rows: {nRows}
      </div>
      <div>
        <pre>
          {JSON.stringify(
            queryResult?.batches
              .at(currentPage)
              ?.toArray()
              .map((r) => r.toJSON()),
            (_, v) => (typeof v === "bigint" ? v.toString() : v),
            2
          )}
        </pre>
      </div>
    </div>
  );
};

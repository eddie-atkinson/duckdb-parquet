import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { ChangeEvent, useRef, useState } from "preact/compat";
import * as arrow from "@apache-arrow/ts";
import { useDBConnection } from "@/hooks/useDBConnection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Downloader } from "./downloader";
import { h } from "preact";
import { DataTable } from "./data-table";
import { FileUploader } from "./file-uploader";

export const Content = () => {
  const { loading, connection } = useDBConnection();

  const [queryResult, setQueryResult] = useState<arrow.Table | null>(null);
  const [currentPage] = useState<number>(0);

  if (loading) {
    return <div>Waiting for DB to initialise</div>;
  }

  const queryRef = useRef<null | HTMLInputElement>(null);

  const onQuery = async (e: ChangeEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    const queryString = queryRef.current?.value ?? "";
    console.log(queryString);

    const result = await connection.query(queryString);
    // @ts-ignore
    setQueryResult(result);
  };

  const nPages = queryResult?.batches.length;
  const nRows = queryResult?.numRows;
  console.log(queryResult);

  return (
    <div className="flex flex-col p-10 gap-2">
      <form onSubmit={onQuery}>
        <div className="flex justify-center space-x-2">
          <Input type="text" name="query" className="input" ref={queryRef} />
          <Button type="submit">Query</Button>
          <Downloader queryRef={queryRef} />
        </div>
      </form>
      <FileUploader />
      <div>
        N pages of results: {nPages} <hr /> N rows: {nRows}
      </div>
      <DataTable queryResult={queryResult} />
    </div>
  );
};

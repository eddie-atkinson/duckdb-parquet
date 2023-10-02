import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDBConnection } from "@/hooks/useDBConnection";
import * as arrow from "@apache-arrow/ts";
import { FormEvent, useRef, useState } from "react";
import { DataTable } from "./data-table";
import { Downloader } from "./downloader";
import { FileUploader } from "./file-uploader";

export const Content = () => {
  const { loading, connection } = useDBConnection();

  const [queryResult, setQueryResult] = useState<arrow.Table | null>(null);
  const [currentPage] = useState<number>(0);
  const queryRef = useRef<null | HTMLInputElement>(null);

  if (loading) {
    return <div>Waiting for DB to initialise</div>;
  }

  const onQuery = async (e: FormEvent<HTMLFormElement>) => {
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

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
  const queryRef = useRef<null | HTMLInputElement>(null);

  if (loading) {
    return <div>Waiting for DB to initialise</div>;
  }

  const onQuery = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryString = queryRef.current?.value ?? "";
    console.log(queryString);

    const result = await connection.query(queryString);
    setQueryResult(result);
  };

  const onFileAccept = () => {
    setQueryResult(null);
    queryRef.current?.focus();
  };

  return (
    <div className="flex flex-col p-10 gap-2">
      <form onSubmit={onQuery}>
        <div className="flex justify-center space-x-2">
          <Input
            type="text"
            name="query"
            className="input"
            ref={queryRef}
            defaultValue="SELECT * FROM data LIMIT 50;"
          />
          <Button type="submit">Query</Button>
          <Downloader queryRef={queryRef} />
        </div>
      </form>
      <FileUploader onFileAccept={onFileAccept} />
      <DataTable queryResult={queryResult} />
    </div>
  );
};

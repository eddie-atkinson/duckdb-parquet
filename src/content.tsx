import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { ChangeEvent, useRef, useState } from "preact/compat";
import { useDBConnection } from "./hooks/useDBConnection";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

export const Content = () => {
  const { db, loading, connection } = useDBConnection();
  const [queryData, setQueryData] = useState<any[]>([]);
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
    const result = (await connection.query(queryString))
      .toArray()
      .map((r) => r.toJSON());
    setQueryData(result);
  };

  return (
    <div className="flex flex-col p-10 gap-2">
      <form onSubmit={onQuery}>
        <div className="flex justify-center space-x-2">
          <Input type="text" name="query" className="input" ref={queryRef} />
          <Button type="submit">Query</Button>
        </div>
      </form>
      <Input
        className="max-w-sm"
        type="file"
        accept=".parquet"
        onChange={fileChangeHandler}
        label="Run a query"
      />
      <div>
        <pre>
          {JSON.stringify(
            queryData,
            (_, v) => (typeof v === "bigint" ? v.toString() : v),
            2
          )}
        </pre>
      </div>
    </div>
  );
};

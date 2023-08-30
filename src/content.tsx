import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { ChangeEvent } from "preact/compat";
import { useDBConnection } from "./hooks/useDBConnection";

export const Content = () => {
  const { db, loading, connection } = useDBConnection();

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

  return (
    <div>
      <input type="text" />
      <input type="file" accept=".parquet" onChange={fileChangeHandler} />
      <button
        onClick={() => {
          console.log(
            connection
              .query(`SELECT * from data;`)
              .then((res) => res.toArray().map((r) => r.toJSON()))
          );
        }}
      >
        Click me
      </button>
    </div>
  );
};

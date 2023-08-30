import {
  AsyncDuckDB,
  AsyncDuckDBConnection,
  DuckDBDataProtocol,
} from "@duckdb/duckdb-wasm";
import { ChangeEvent } from "preact/compat";

interface FileUploaderProps {
  db: AsyncDuckDB;
}

export const FileUploader = ({ db }: FileUploaderProps) => {
  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) {
      return;
    }
    const [file] = files;

    if (!file.name.endsWith(".parquet")) {
      return;
    }

    await db.registerFileHandle(
      file.name,
      file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true
    );
    // console.log(
    //   connection
    //     .query(`SELECT * from 'data.parquet';`)
    //     .then((res) => res.toArray().map((r) => r.toJSON()))
    // );
  };
  return (
    <div>
      <input type="file" accept=".parquet" onChange={onChange} />
    </div>
  );
};

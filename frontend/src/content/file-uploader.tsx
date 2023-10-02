import { useDBConnection } from "@/hooks/useDBConnection";
import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import clsx from "clsx";
import { h } from "preact";
import { useDropzone } from "react-dropzone";

export const FileUploader = () => {
  const { db, connection } = useDBConnection();

  const fileChangeHandler = async (files: File[]) => {
    if (!files || !files?.[0]?.name?.endsWith(".parquet")) {
      return;
    }
    const [file] = files;

    console.log(file.prototype);
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

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,

    isDragActive,
  } = useDropzone({
    accept: { "application/x-parquet": [".parquet"] },
    multiple: false,
    onDragOver: undefined,
    onDragLeave: undefined,
    onDragEnter: undefined,
    onDrop: fileChangeHandler,
  });

  const [acceptedFile] = acceptedFiles;

  return (
    <div
      {...getRootProps({
        className: clsx({
          dropzone: true,
          "max-w-full": true,
          border: true,
          "border-dashed": true,
          "p-8": true,
          "m-1": true,
          flex: true,
          "justify-center": true,
          "border-2": isDragActive,
        }),
      })}
    >
      <input {...getInputProps()} type="file" />

      <p>
        {!!acceptedFile ? acceptedFile.name : "Drag n' drop or select a file"}
      </p>
      <br />
    </div>
  );
};

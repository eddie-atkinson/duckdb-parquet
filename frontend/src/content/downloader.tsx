import { Button } from "@/components/ui/button";
import { useDBConnection } from "@/hooks/useDBConnection";
import { FunctionComponent, MutableRefObject, useState } from "react";
import { FileType, FileTypeSelector } from "./file-type-selector";

export interface DownloaderProps {
  queryRef: MutableRefObject<HTMLInputElement | null>;
}

type CsvFile = `${string}.csv`;
type ParquetFile = `${string}.parquet`;

type ExportQuery =
  | `COPY (${string}) TO '${ParquetFile}' (FORMAT PARQUET)`
  | `COPY (${string}) TO '${CsvFile}' (HEADER, DELIMITER '${string}')`;

const downloadFile = (data: Uint8Array, fileName: string) => {
  const blob = new Blob([data]);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

const createExport = (
  fileType: FileType,
  query: string
): { fileName: string; query: ExportQuery } => {
  const name = new Date().toISOString();

  const fileName = `${name}.${fileType}`;

  console.log(name);
  switch (fileType) {
    case "csv": {
      return {
        fileName,
        query: `COPY (${query}) TO '${name}.csv' (HEADER, DELIMITER ',')`,
      };
    }
    case "parquet": {
      return {
        fileName,
        query: `COPY (${query}) TO '${name}.parquet' (FORMAT PARQUET)`,
      };
    }
  }
};

export const Downloader: FunctionComponent<DownloaderProps> = ({
  queryRef,
}) => {
  const [fileType, setFileType] = useState<FileType>("csv");
  const { db, loading, connection } = useDBConnection();

  const handleFileDownload = async () => {
    if (!connection || !queryRef) {
      return;
    }

    const { fileName, query } = createExport(
      fileType,
      queryRef?.current?.value ?? ""
    );

    console.log(query);
    await connection.query(query);

    try {
      const res = await db.copyFileToBuffer(fileName);
      downloadFile(res, fileName);
    } finally {
      await db.dropFile(fileName);
    }
  };
  return (
    <>
      <FileTypeSelector
        value={fileType}
        onChange={(v) => v && setFileType(v)}
      />
      <Button disabled={loading} onClick={handleFileDownload}>
        Download
      </Button>
    </>
  );
};

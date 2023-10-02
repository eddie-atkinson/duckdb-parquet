import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useDuckDB, useDuckDBResolver } from "@duckdb/react-duckdb";
import { useEffect, useState } from "react";

const useDB = () => {
  const db = useDuckDB();
  const resolveDB = useDuckDBResolver();
  useEffect(() => {
    if (!db.resolving()) {
      resolveDB();
    }
  }, [db]);

  return db.value;
};
const useConnection = (
  db: AsyncDuckDB | null
): null | AsyncDuckDBConnection => {
  const [connection, setConnection] = useState<null | AsyncDuckDBConnection>(
    null
  );

  useEffect(() => {
    db && db.connect().then((connection) => setConnection(connection));
  }, [db]);

  if (!db || !connection) {
    return null;
  }

  return connection;
};

export const useDBConnection = () => {
  const db = useDB();
  const connection = useConnection(db);

  const loading = db === null || connection === null;
  if (loading) {
    return { loading, db: null, connection: null };
  }

  return {
    loading: false,
    db,
    connection,
  };
};

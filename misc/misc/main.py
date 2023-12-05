from pathlib import Path
import pandas as pd
import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq
import random
import string
from datetime import timedelta

# Set a seed for reproducibility
np.random.seed(42)


# Function to generate random data for each supported Parquet type
def generate_random_data(data_type, size=10):
    if data_type == "NONE":
        return None
    elif data_type == "Null":
        return [None] * size
    elif data_type == "Int":
        return np.random.randint(-2147483648, 2147483647, size=size, dtype="int32")
    elif data_type == "Float":
        return np.random.rand(size).astype("float64")
    elif data_type == "Binary":
        return [bytes([random.randint(0, 255) for _ in range(5)]) for _ in range(size)]
    elif data_type == "Utf8":
        return [
            "".join(random.choice(string.ascii_letters) for _ in range(10))
            for _ in range(size)
        ]
    elif data_type == "Bool":
        return np.random.choice([True, False], size=size)
    elif data_type == "Decimal":
        return np.random.rand(size).astype("float64")
    elif data_type == "Date":
        return pd.to_datetime("2022-01-01") + pd.to_timedelta(
            np.random.randint(1, 365, size=size), "D"
        )
    elif data_type == "Time":
        return np.random.randint(0, 86400, size=size)
    elif data_type == "Timestamp":
        return pd.to_datetime("2022-01-01") + pd.to_timedelta(
            np.random.randint(1, 365, size=size), "D"
        )
    elif data_type == "Interval":
        return [timedelta(days=random.randint(1, 10)) for _ in range(size)]
    elif data_type == "List":
        return [
            list(np.random.randint(-100, 100, size=random.randint(1, 5)))
            for _ in range(size)
        ]
    elif data_type == "Struct":
        return [
            {
                "field1": random.randint(1, 100),
                "field2": {
                    "nested_field": list(
                        np.random.randint(-100, 100, size=random.randint(1, 5))
                    )
                },
            }
            for _ in range(size)
        ]
    elif data_type == "Union":
        return [
            random.choice(
                [
                    None,
                    np.random.randint(-2147483648, 2147483647),
                    np.random.rand(),
                ]
            )
            for _ in range(size)
        ]
    elif data_type == "FixedSizeBinary":
        return [bytes([random.randint(0, 255) for _ in range(5)]) for _ in range(size)]
    elif data_type == "FixedSizeList":
        return [list(np.random.randint(-100, 100, size=3)) for _ in range(size)]
    elif data_type == "Map":
        return [
            {
                "key1": list(np.random.randint(-100, 100, size=random.randint(1, 5))),
                "key2": list(np.random.randint(-100, 100, size=random.randint(1, 5))),
            }
            for _ in range(size)
        ]
    else:
        raise ValueError(f"Unsupported data type: {data_type}")


# Specify the data types supported by the Parquet standard
parquet_data_types = [
    "NONE",
    "Null",
    "Int",
    "Float",
    "Binary",
    "Utf8",
    "Bool",
    "Decimal",
    "Date",
    "Time",
    "Timestamp",
    "Interval",
    "List",
    "Struct",
    "Union",
    "FixedSizeBinary",
    "FixedSizeList",
    "Map",
]

# Create a DataFrame with random data for each data type
data = {data_type: generate_random_data(data_type) for data_type in parquet_data_types}
df = pd.DataFrame(data)

# Specify the file name for the Parquet file
parquet_file = Path("~/Downloads/random_data_with_all_types_and_union.parquet")

# Write the DataFrame to a Parquet file
table = pa.Table.from_pandas(df)
pq.write_table(table, parquet_file)

print(f"Parquet file '{parquet_file}' generated successfully.")

import pyarrow as pa
import pyarrow.parquet as pq


lorem_ipsum = """ Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut rutrum nunc. Ut vitae luctus sem. Donec auctor nunc vel pretium feugiat. Etiam libero metus, tempus sed erat vel, facilisis fermentum tellus. Donec non faucibus mi, eu cursus quam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut faucibus tempor neque eu auctor. Nam non faucibus odio.

Aliquam urna lectus, viverra ac fermentum faucibus, tincidunt in risus. Aenean quis erat euismod, volutpat nisi id, eleifend erat. Vivamus eleifend ex dolor, non ornare magna maximus nec. Mauris feugiat erat sed pretium ultrices. Maecenas vel metus quis leo porttitor tincidunt non sed nisi. Nulla mollis lorem metus, vitae ornare felis imperdiet eget. Sed tortor diam, consequat id dictum at, tincidunt at dui. Duis sagittis ornare turpis, ac mattis est ornare vitae.

Mauris elementum ipsum eu diam sollicitudin ullamcorper. Aliquam interdum sapien id vestibulum blandit. Phasellus tincidunt nunc eu nunc vulputate viverra. Nulla fringilla in felis nec feugiat. Aenean nec velit lectus. Nam laoreet augue sit amet orci vulputate, non iaculis purus laoreet. Duis quis est aliquet, fermentum ante sit amet, ultrices massa. Sed fermentum vulputate erat sit amet efficitur. Vestibulum condimentum urna a nulla accumsan cursus nec id magna. Vestibulum sit amet purus mattis, iaculis lectus eget, posuere est. Duis et lacus sapien. """


def main():
    t1 = pa.int32()
    t6 = pa.list_(t1)
    fields = [
        pa.field("boolean", pa.bool_()),
        # pa.field("int8", pa.int8()),
        # pa.field("int16", pa.int16()),
        # pa.field("int32", pa.int32()),
        # pa.field("int64", pa.int64()),
        # pa.field("float32", pa.float32()),
        # pa.field("float64", pa.float64()),
        # pa.field("string", pa.string()),
        # pa.field("binary", pa.binary()),
        # pa.field("timestamp", pa.timestamp("ms")),
        # pa.field("date", pa.date32()),
        # pa.field("list", pa.list_(pa.int32())),
    ]
    # table = pa.Table.from_arrays(
    #     [
    #         pa.array([True, False, True]),
    #         # pa.array([-1, 0, 1]),
    #         # pa.array([-32768, 0, 32767]),
    #         # pa.array([-2147483648, 0, 2147483647]),
    #         # pa.array([-9223372036854775808, 0, 9223372036854775807]),
    #         # pa.array([1.5, 0.0, -1.0]),
    #         # pa.array([3.14159, 0.0, -2.71828]),
    #         # pa.array(["foo", "bar", "baz"]),
    #         # pa.array([b"hello", b"world", b"!"]),
    #         # pa.array(
    #         #     [
    #         #         pa.Timestamp("2023-10-02T12:02:23.123456Z"),
    #         #         None,
    #         #         pa.Timestamp("2023-10-03T00:00:00.000000Z"),
    #         #     ]
    #         # ),
    #         # pa.array([pa.Date("2023-10-02"), None, pa.Date("2023-10-03")]),
    #         # pa.array([pa.array([1, 2, 3])]),
    #     ],
    #     schema=fields,
    # )

    pylist = [
        {
            "boolean": True,
            "int8": -1,
            "int16": -32768,
            "int32": -2147483648,
            "int64": -9223372036854775808,
            "float32": 1.5,
            "float64": 3.14159,
            "string": "foo",
            "binary": b"hello",
            "timestamp": 1251763200000,
            "date": 1251765000000,
            # "timedelta": "1:00:00",
            "list": [10, -(2**30), 2**30],
            # "bson": b'{""foo"": ""bar""}',
            # "json": b'[""foo"", ""bar"", ""baz""]',
            # "array_of_ints": [1, 2, 3],
            # "union_of_ints_and_strings": [1, "foo"],
            "tz_timestamp": 1688233600010,
        },
        {
            "boolean": False,
            "int8": 0,
            "int16": 0,
            "int32": 0,
            "int64": 0,
            "float32": 0.0,
            "float64": 0.0,
            "string": "bar",
            "binary": b"world",
            "timestamp": 1688133600000,
            "date": 1688133000000,
            # "timedelta": "-1:00:00",
            "list": [5, 454435433, 4823954],
            # "bson": None,
            # "json": None,
            # "array_of_ints": None,
            # "union_of_ints_and_strings": [None, "foo"],
            "tz_timestamp": 1688133600010,
        },
    ]

    my_schema = pa.schema(
        [
            pa.field("boolean", pa.bool_()),
            pa.field("int8", pa.int8()),
            pa.field("int16", pa.int16()),
            pa.field("int32", pa.int32()),
            pa.field("int64", pa.int64()),
            pa.field("float32", pa.float32()),
            pa.field("float64", pa.float64()),
            pa.field("string", pa.string()),
            pa.field("binary", pa.binary()),
            pa.field("timestamp", pa.timestamp("ms")),
            pa.field("date", pa.date64()),
            pa.field("list", pa.list_(pa.int32())),
            pa.field("tz_timestamp", pa.timestamp("ms", tz="Australia/Melbourne")),
        ],
    )

    table = pa.Table.from_pylist(pylist, schema=my_schema)

    print(table)
    breakpoint()
    pq.write_table(table, "output/test.parquet", compression=None)


if __name__ == "__main__":
    main()

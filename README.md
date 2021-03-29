# Tabular
A generic API server to query and insert data into postgres data store. Server exposes one endpoint for
operations of "read" and "write" to be performed against the DB.


## /query
The endpoint accepts a `POST` request with a JSON body. The body has the following definition,

```ts
interface FilterExpression {
  [ColumnName: string]: { [Operator: string]: string };
}

interface Query {
  query: "read" | "write";
  table: string;
  fields: [{ name: string; value?: unknown }];
  where: FilterExpression[] | undefined | null;
  sortBy:
    | [
        {
          name: string;
          direction: "asc" | "desc";
        }
      ]
    | undefined
    | null;
}
```

Given this structure, server now generates SQL statements accordingly.

## Dataset
A sample dataset of https://raw.githubusercontent.com/kohanyirobert/chinook-database/master/ChinookDatabase/DataSources/Chinook_PostgreSql_SerialPKs_CaseInsensitive.sql was used to prepopulate the database.



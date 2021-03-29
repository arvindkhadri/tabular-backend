/* A class to represent a request instance.
request can be of two types, read or update.
read request example
{
  query: read
  table: Album
  fields: [
    {name: AlbumId},
    {name: Title},
    {name: ArtistId}
  ] | *
  where: FilterExpression | undefined
  sortBy: [{
    name: AlbumId
    direction: asc
  }] | undefined
}

filterExpression

[{
  AlbumId:{_eq: 1}
}]

*/

import ApplicationError from "./ApplicationError";

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

const opMap: { [key: string]: string } = {
  _eq: "=",
  _gte: ">=",
  _gt: ">",
  _lte: "<=",
  _lt: "<",
  _neq: "<>",
};

export default class RequestParser {
  request: Query;

  constructor(request: Query) {
    this.request = request;
  }

  parse(): string {
    /* 
      Parse the query object and generate sql statements based on the params passed.
    */
    let queryString = "";
    if (this.request.query === "read") {
      queryString = queryString.concat("select ");

      const fields = this.request.fields.map((field) => field.name);

      queryString = queryString.concat(`${fields} from ${this.request.table}`);

      if (this.request.where && this.request.where.length) {
        let whereClause: string[] = [];
        whereClause = this.request.where.map((val) => {
          const key = Object.keys(val)[0];
          return `${key} ${opMap[Object.keys(val[key])[0]]} '${
            Object.values(Object.values(val)[0])[0]
          }'`;
        });
        queryString = queryString.concat(" where ", whereClause.join(" and "));
      }

      if (this.request.sortBy && this.request.sortBy.length) {
        let sortByClause: string[] = [];
        sortByClause = this.request.sortBy.map((val) => {
          return `${val.name} ${val.direction}`;
        });
        queryString = queryString.concat(" order by ", sortByClause.join(", "));
      }
      queryString = queryString.concat(";");
      return queryString;
    } else if (this.request.query === "write") {
      const orderedFields = this.request.fields
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((val) => val.name)
        .join(", ");
      const orderedValues = this.request.fields
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((val) => `'${val.value}'`)
        .join(", ");
      queryString = queryString.concat(
        `INSERT INTO ${this.request.table}(${orderedFields}) values (${orderedValues}) RETURNING *;`
      );
      return queryString;
    } else {
      throw new ApplicationError("Invalid operation specified.");
    }
  }
}

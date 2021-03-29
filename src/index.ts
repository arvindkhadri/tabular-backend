import express, { response } from "express";
import process from "process";
import { Client } from "pg";
import dotenv from "dotenv";
import cors from "cors";
import RequestParser from "./request";
import ApplicationError from "./ApplicationError";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const port = process.env.PORT || 3000;

app.post("/query", async (req, res) => {
  const { request } = req.body;
  try {
    const parser = new RequestParser(request);
    const output = parser.parse();
    let queryResponse;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      queryResponse = await client.query(output);
    } catch (error) {
      console.log(error.message);
      throw new ApplicationError(error.message);
    } finally {
      client.end();
    }
    res.send({ output: queryResponse.rows });
  } catch (error) {
    res.status(error.status || 500);
    res.send({ err: error.message || error });
  }
});

app.get("/schema", async (req, res) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const response = await client.query(`
    SELECT *
    FROM pg_catalog.pg_tables
    WHERE schemaname != 'pg_catalog' AND
        schemaname != 'information_schema';
    `);
  res.send({ output: response.rows });
});

app
  .listen(port, () => {
    return console.log(`server is listening on ${port}`);
  })
  .on("error", (err) => {
    console.log("Server startup error");
    console.log(err);
  });

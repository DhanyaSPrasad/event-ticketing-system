import mysql from "mysql2/promise";

const globalForMySQL = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

export const pool =
  globalForMySQL.mysqlPool ??
  mysql.createPool({
    host: process.env.MYSQL_HOST ?? "localhost",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "event_ticketing",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    decimalNumbers: true
  });

if (process.env.NODE_ENV !== "production") globalForMySQL.mysqlPool = pool;

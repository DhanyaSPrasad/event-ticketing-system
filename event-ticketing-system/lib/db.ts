import mysql from "mysql2/promise";

type PoolCache = {
  adminPool?: mysql.Pool;
  customerPool?: mysql.Pool;
  authPool?: mysql.Pool;
};

const cache = globalThis as unknown as PoolCache;

function makePool(role: "ADMIN" | "CUSTOMER" | "AUTH") {
  // Never fall back to root or a shared account. A deliberately invalid
  // placeholder makes missing configuration fail at connection time, not
  // during Next.js build-time module loading.
  const user = process.env[`MYSQL_${role}_USER`] ?? `__missing_${role.toLowerCase()}_user__`;
  const password = process.env[`MYSQL_${role}_PASSWORD`] ?? "";

  return mysql.createPool({
    host: process.env.MYSQL_HOST ?? "localhost",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user,
    password,
    database: process.env.MYSQL_DATABASE ?? "event_ticketing",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    decimalNumbers: true
  });
}

export const adminPool = cache.adminPool ?? makePool("ADMIN");
export const customerPool = cache.customerPool ?? makePool("CUSTOMER");
export const authPool = cache.authPool ?? makePool("AUTH");

if (process.env.NODE_ENV !== "production") {
  cache.adminPool = adminPool;
  cache.customerPool = customerPool;
  cache.authPool = authPool;
}

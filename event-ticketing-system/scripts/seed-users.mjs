import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "localhost",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "event_ticketing"
});

try {
  const passwordHash = await bcrypt.hash("Demo123!", 10);
  await connection.execute(
    `INSERT INTO Users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role)`,
    ["Demo Admin", "admin@example.com", passwordHash, "Admin"]
  );
  await connection.execute(
    `INSERT INTO Users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role)`,
    ["Demo Customer", "customer@example.com", passwordHash, "Customer"]
  );
  console.log("Demo users created. Both passwords are Demo123!");
} finally {
  await connection.end();
}

import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "jerrygeorgejoshi2004",
  database: "maintenance_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

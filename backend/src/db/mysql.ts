import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "jerrygeorgejoshi2004",
  database: "maintenance_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

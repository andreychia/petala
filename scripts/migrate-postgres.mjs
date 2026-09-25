import { Pool } from "pg";
import { readFile } from "node:fs/promises";
import { pbkdf2Sync, randomBytes } from "node:crypto";

if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = await readFile(new URL("../db/postgres.sql", import.meta.url), "utf8");
try {
  await pool.query(sql);
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    const email = (process.env.ADMIN_EMAIL || "admin@petala.pe").trim().toLowerCase();
    const name = (process.env.ADMIN_NAME || "Administrador Petala").trim();
    const salt = randomBytes(16).toString("base64url");
    const passwordHash = pbkdf2Sync(adminPassword, Buffer.from(salt, "base64url"), 210000, 32, "sha256").toString("base64url");
    await pool.query(
      `INSERT INTO admin_users (email, name, password_hash, password_salt)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash, password_salt=EXCLUDED.password_salt, active=true`,
      [email, name, passwordHash, salt],
    );
    console.log(`Administrador listo: ${email}`);
  } else {
    console.log("ADMIN_PASSWORD no definido; no se modificaron cuentas administradoras.");
  }
  console.log("Esquema PostgreSQL listo.");
} finally {
  await pool.end();
}

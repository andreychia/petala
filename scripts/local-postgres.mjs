import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { Client } from "pg";
import * as binaries from "@embedded-postgres/windows-x64";

const directory = resolve(".local-postgres");
const data = resolve(directory, "data");
const password = process.env.POSTGRES_PASSWORD;
if (!password) throw new Error("Falta POSTGRES_PASSWORD en .env.local");
const adminOptions = {
  user: process.env.POSTGRES_ADMIN_USER || "petala",
  password: process.env.POSTGRES_ADMIN_PASSWORD || password,
  host: "127.0.0.1",
  port: 55434,
  database: "postgres",
  connectionTimeoutMillis: 1000,
};
mkdirSync(directory, { recursive: true });

if (!existsSync(resolve(data, "PG_VERSION"))) {
  const passwordFile = resolve(directory, "init-password");
  writeFileSync(passwordFile, password, { mode: 0o600 });
  try {
    const init = spawnSync(binaries.initdb, ["-D", data, "-U", "petala", `--pwfile=${passwordFile}`, "--auth=scram-sha-256", "--encoding=UTF8", "--locale=C"], { stdio: "inherit", windowsHide: true });
    if (init.status !== 0) throw new Error("No se pudo inicializar PostgreSQL");
  } finally { unlinkSync(passwordFile); }
}

const child = spawn(binaries.postgres, ["-D", data, "-h", "127.0.0.1", "-p", "55434"], { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
child.stderr.on("data", (chunk) => { if (/FATAL|ERROR/.test(String(chunk))) console.error(String(chunk)); });

let ready = false;
for (let attempt = 0; attempt < 50; attempt++) {
  const client = new Client(adminOptions);
  try { await client.connect(); await client.end(); ready = true; break; }
  catch { await client.end().catch(() => {}); await new Promise((resolve) => setTimeout(resolve, 200)); }
}
if (!ready) throw new Error("PostgreSQL no inició a tiempo");

const admin = new Client(adminOptions);
await admin.connect();
const role = await admin.query("SELECT 1 FROM pg_roles WHERE rolname='petala'");
if (!role.rowCount) {
  const escapedPassword = password.replaceAll("'", "''");
  await admin.query(`CREATE ROLE petala LOGIN PASSWORD '${escapedPassword}'`);
}
const database = await admin.query("SELECT 1 FROM pg_database WHERE datname='petala'");
if (!database.rowCount) await admin.query("CREATE DATABASE petala OWNER petala");
await admin.end();

const connection = `postgresql://petala:${encodeURIComponent(password)}@127.0.0.1:55434/petala`;
const migrated = spawnSync(process.execPath, ["scripts/migrate-postgres.mjs"], { stdio: "inherit", windowsHide: true, env: { ...process.env, DATABASE_URL: connection } });
if (migrated.status !== 0) process.exit(1);
console.log("PostgreSQL listo en 127.0.0.1:55434 (base: petala).");

async function stop() {
  spawnSync(binaries.pg_ctl, ["-D", data, "stop", "-m", "fast", "-w"], { stdio: "inherit", windowsHide: true });
  process.exit(0);
}
process.on("SIGINT", stop); process.on("SIGTERM", stop); setInterval(() => {}, 60000);

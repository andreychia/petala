import { Pool } from "pg";

const globalDb = globalThis as unknown as { petalaPool?: Pool };

export function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL no está configurada");
  if (!globalDb.petalaPool) {
    globalDb.petalaPool = new Pool({ connectionString, max: 8, connectionTimeoutMillis: 5000 });
    globalDb.petalaPool.on("error", (error) => console.error("Conexión PostgreSQL cerrada:", error.message));
  }
  return globalDb.petalaPool;
}

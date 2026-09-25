import { getAdminUser } from "../../../lib/admin-auth";
import { db } from "../../../lib/postgres";

function json(data: unknown, status = 200) { return Response.json(data, { status }); }
async function authorized() { return Boolean(await getAdminUser()); }

export async function GET() {
  if (!(await authorized())) return json({ error: "No autorizado" }, 401);
  const result = await db().query("SELECT id::int, name, description, price, stock, category, season, featured::int, active::int FROM products ORDER BY active DESC, featured DESC, id DESC");
  return json(result.rows);
}

export async function POST(request: Request) {
  if (!(await authorized())) return json({ error: "No autorizado" }, 401);
  const body = await request.json() as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const stock = Math.max(0, Number(body.stock) || 0);
  if (!name || !Number.isFinite(price) || price < 0) return json({ error: "Revisa el nombre y precio" }, 400);
  const result = await db().query("INSERT INTO products (name, description, price, stock, category, season, featured, active, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,true,now()) RETURNING id::int, name, description, price, stock, category, season, featured::int, active::int", [name, String(body.description ?? ""), Math.round(price), stock, String(body.category ?? "Ramos"), String(body.season ?? "Todo el año"), Boolean(body.featured)]);
  return json(result.rows[0], 201);
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return json({ error: "No autorizado" }, 401);
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id)) return json({ error: "Producto inválido" }, 400);
  await db().query("UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category=$5, season=$6, featured=$7, active=$8, updated_at=now() WHERE id=$9", [String(body.name ?? ""), String(body.description ?? ""), Math.round(Number(body.price) || 0), Math.max(0, Number(body.stock) || 0), String(body.category ?? "Ramos"), String(body.season ?? "Todo el año"), Boolean(body.featured), !(body.active === false || body.active === 0), id]);
  return json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await authorized())) return json({ error: "No autorizado" }, 401);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return json({ error: "Producto inválido" }, 400);
  await db().query("UPDATE products SET active=false, updated_at=now() WHERE id=$1", [id]);
  return json({ ok: true });
}

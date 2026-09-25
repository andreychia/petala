import { getAdminUser } from "../../../../lib/admin-auth";
import { db } from "../../../../lib/postgres";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const form = await request.formData();
  const id = Number(form.get("id"));
  const image = form.get("image");
  if (!Number.isInteger(id) || !(image instanceof File)) return Response.json({ error: "Archivo inválido" }, { status: 400 });
  if (!allowedTypes.has(image.type)) return Response.json({ error: "Usa JPG, PNG o WebP" }, { status: 415 });
  if (image.size > maxBytes) return Response.json({ error: "La imagen supera 5 MB" }, { status: 413 });
  const bytes = Buffer.from(await image.arrayBuffer());
  await db().query("UPDATE products SET image_data=$1, image_type=$2, updated_at=now() WHERE id=$3", [bytes, image.type, id]);
  return Response.json({ ok: true });
}

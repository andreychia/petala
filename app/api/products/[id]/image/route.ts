import { db } from "../../../../../lib/postgres";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await db().query<{ image_data: Buffer | null; image_type: string | null }>("SELECT image_data, image_type FROM products WHERE id=$1 AND active=true", [Number(id)]);
  const image = result.rows[0];
  if (!image?.image_data || !image.image_type) return Response.redirect(new URL("/flores-amarillas.png", request.url), 307);
  return new Response(new Uint8Array(image.image_data), { headers: { "Content-Type": image.image_type, "Cache-Control": "no-store" } });
}

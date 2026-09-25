import { cookies } from "next/headers";
import { hashSessionToken, sessionCookie } from "../../../../lib/admin-auth";
import { db } from "../../../../lib/postgres";

export async function POST(request: Request) {
  const token = (await cookies()).get(sessionCookie.name)?.value;
  if (token) await db().query("DELETE FROM admin_sessions WHERE token_hash=$1", [await hashSessionToken(token)]);
  return new Response(null, { status: 303, headers: {
    Location: new URL("/login", request.url).toString(),
    "Set-Cookie": `${sessionCookie.name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  }});
}

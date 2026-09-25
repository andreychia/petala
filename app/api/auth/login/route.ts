import { createSessionToken, hashPassword, hashSessionToken, sessionCookie } from "../../../../lib/admin-auth";
import { db } from "../../../../lib/postgres";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const users = await db().query<{ id: number; email: string; name: string; password_hash: string; password_salt: string }>("SELECT id::int, email, name, password_hash, password_salt FROM admin_users WHERE email=$1 AND active=true", [email]);
  const user = users.rows[0];
  const valid = user && await hashPassword(password, user.password_salt) === user.password_hash;
  if (!valid) return Response.redirect(new URL("/login?error=1", request.url), 303);

  const token = createSessionToken();
  const tokenHash = await hashSessionToken(token);
  await db().query("DELETE FROM admin_sessions WHERE expires_at<=now()");
  await db().query("INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now()+interval '7 days')", [tokenHash, user.id]);
  return new Response(null, { status: 303, headers: {
    Location: new URL("/admin", request.url).toString(),
    "Set-Cookie": `${sessionCookie.name}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionCookie.maxAge}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`,
  }});
}

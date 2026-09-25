import { Flower2, LockKeyhole, Mail } from "lucide-react";
import { getAdminUser } from "../../lib/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminUser()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="login-page">
    <section className="login-visual"><a className="brand brand-light" href="/"><Flower2/><span>PÉTALA</span></a><div><p className="eyebrow">Administración</p><h1>Cuida cada detalle,<br/><em>desde un solo lugar.</em></h1><p>Productos, temporadas y existencias siempre al día.</p></div></section>
    <section className="login-form-wrap"><form className="login-form" action="/api/auth/login" method="post"><p className="eyebrow">Acceso privado</p><h2>Bienvenido</h2><p>Ingresa con tu cuenta de administrador.</p>{error && <div className="login-error">Correo o contraseña incorrectos.</div>}<label>Correo electrónico<div><Mail size={18}/><input name="email" type="email" autoComplete="username" required placeholder="admin@petala.pe"/></div></label><label>Contraseña<div><LockKeyhole size={18}/><input name="password" type="password" autoComplete="current-password" required placeholder="••••••••••••"/></div></label><button type="submit">Ingresar al panel</button><a href="/">← Volver a la tienda</a></form></section>
  </main>;
}

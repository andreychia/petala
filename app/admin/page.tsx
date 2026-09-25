import { ArrowLeft, Flower2, LogOut } from "lucide-react";
import { requireAdmin } from "../../lib/admin-auth";
import { db } from "../../lib/postgres";
import AdminDashboard, { type AdminProduct } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin();
  let products: AdminProduct[] = [];
  try {
    const result = await db().query<AdminProduct>("SELECT id::int, name, description, price, stock, category, season, featured::int, active::int FROM products ORDER BY active DESC, featured DESC, id DESC");
    products = result.rows;
  } catch {}
  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <a className="brand brand-light" href="/"><Flower2/><span>PÉTALA</span></a>
      <div className="admin-nav"><span>Panel</span><a className="active" href="#inventario">Inventario</a><a href="#temporadas">Temporadas</a><a href="/" target="_blank" rel="noopener noreferrer">Ver tienda</a></div>
      <div className="admin-user"><div>{user.name.slice(0, 1).toUpperCase()}</div><p><strong>{user.name}</strong><span>Administrador</span></p></div>
      <form action="/api/auth/logout" method="post"><button className="signout" type="submit"><LogOut size={17}/> Cerrar sesión</button></form>
    </aside>
    <section className="admin-content">
      <a className="back-store" href="/"><ArrowLeft size={16}/> Volver a la tienda</a>
      <AdminDashboard initialProducts={products}/>
    </section>
  </main>;
}

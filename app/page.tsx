import { ArrowRight, Camera, Flower2, MapPin, MessageCircle } from "lucide-react";
import Storefront, { type Product } from "./storefront";
import { db } from "../lib/postgres";

export const dynamic = "force-dynamic";

const fallbackProducts: Product[] = [
  { id: 1, name: "Sol de septiembre", description: "Girasoles, rosas amarillas y follaje de estación.", price: 129, stock: 8, category: "Ramos", season: "Flores amarillas", featured: 1 },
  { id: 2, name: "Jardín crema", description: "Rosas marfil, lisianthus y eucalipto fresco.", price: 149, stock: 5, category: "Ramos", season: "Todo el año", featured: 1 },
  { id: 3, name: "Abrazo silvestre", description: "Flores de campo con una composición libre y delicada.", price: 99, stock: 0, category: "Silvestres", season: "Primavera", featured: 0 },
  { id: 4, name: "Caja de luz", description: "Selección amarilla presentada en caja de autor.", price: 169, stock: 3, category: "Cajas", season: "Flores amarillas", featured: 1 },
];

async function loadProducts(): Promise<Product[]> {
  try {
    const result = await db().query<Product>("SELECT id::int, name, description, price, stock, category, season, featured::int FROM products WHERE active = true ORDER BY featured DESC, id DESC");
    return result.rows.length ? result.rows : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

export default async function Home() {
  const products = await loadProducts();
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Pétala, inicio"><Flower2 aria-hidden="true"/><span>PÉTALA</span></a>
        <nav aria-label="Navegación principal"><a href="#catalogo">Flores</a><a href="#temporada">Temporada</a><a href="#contacto">Contacto</a></nav>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Florería contemporánea · Lima</p>
          <h1>Flores que<br/><em>dicen más.</em></h1>
          <p className="hero-text">Diseñamos arreglos frescos para celebrar, acompañar y sorprender. Entrega el mismo día en Lima Metropolitana.</p>
          <a className="primary-button" href="#catalogo">Ver colección <ArrowRight size={18}/></a>
          <div className="hero-note"><span>01</span><p><strong>Hecho hoy.</strong><br/>Cada arreglo se prepara a pedido.</p></div>
        </div>
        <div className="hero-image-wrap">
          <img src="/flores-amarillas.png" alt="Ramo de flores amarillas con rosas y girasoles"/>
          <div className="season-stamp"><span>Temporada</span><strong>Flores<br/>amarillas</strong><small>Edición limitada</small></div>
        </div>
      </section>

      <Storefront initialProducts={products}/>

      <section className="season-banner" id="temporada">
        <p className="eyebrow">Edición de temporada</p>
        <h2>Un poco de sol,<br/><em>directo a su puerta.</em></h2>
        <p>Nuestra colección amarilla reúne las flores más luminosas de la estación. Disponible mientras dure la cosecha.</p>
        <a href="#catalogo">Explorar flores amarillas <ArrowRight size={18}/></a>
      </section>

      <footer id="contacto">
        <div className="footer-brand"><Flower2/><span>PÉTALA</span></div>
        <p>Flores frescas, gestos inolvidables.</p>
        <div className="footer-links"><a href="https://wa.me/51999999999"><MessageCircle size={18}/> WhatsApp</a><a href="#"><Camera size={18}/> Instagram</a><span><MapPin size={18}/> Lima, Perú</span></div>
        <small>© 2026 Pétala Florería</small>
      </footer>
    </main>
  );
}

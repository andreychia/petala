"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag, X } from "lucide-react";

export type Product = { id: number; name: string; description: string; price: number; stock: number; category: string; season: string; featured: number };
type CartLine = Product & { quantity: number };

export default function Storefront({ initialProducts }: { initialProducts: Product[] }) {
  const [filter, setFilter] = useState("Todos");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const categories = ["Todos", ...Array.from(new Set(initialProducts.map((p) => p.category)))];
  const products = filter === "Todos" ? initialProducts : initialProducts.filter((p) => p.category === filter);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  function add(product: Product) {
    if (product.stock < 1) return;
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    setOpen(true);
  }

  function change(id: number, delta: number) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(0, Math.min(item.stock, item.quantity + delta)) } : item).filter((item) => item.quantity > 0));
  }

  const orderText = encodeURIComponent(`Hola Pétala, quisiera pedir:\n${cart.map((item) => `• ${item.quantity} × ${item.name} — S/ ${item.price * item.quantity}`).join("\n")}\nTotal: S/ ${total}`);

  return <>
    <section className="catalog" id="catalogo">
      <div className="section-heading"><div><p className="eyebrow">Colección fresca</p><h2>Elige tu <em>favorito.</em></h2></div><p>Arreglos únicos, diseñados con flores seleccionadas cada mañana.</p></div>
      <div className="filters" role="group" aria-label="Filtrar por categoría">{categories.map((category) => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div>
      <div className="product-grid">{products.map((product, index) => <article className="product-card" key={product.id}>
        <div className={`product-image tone-${index % 4}`}><img src={`/api/products/${product.id}/image`} alt={product.name}/>{product.season !== "Todo el año" && <span className="season-tag">{product.season}</span>}{product.stock < 1 && <div className="sold-out">AGOTADO</div>}</div>
        <div className="product-info"><div><p>{product.category}</p><h3>{product.name}</h3></div><strong>S/ {product.price}</strong></div>
        <p className="description">{product.description}</p>
        <button className="add-button" disabled={product.stock < 1} onClick={() => add(product)}>{product.stock > 0 ? <><Plus size={17}/> Agregar</> : "Sin stock"}</button>
      </article>)}</div>
    </section>
    <button className="cart-button" onClick={() => setOpen(true)} aria-label={`Abrir bolsa, ${count} productos`}><ShoppingBag/><span>{count}</span></button>
    {open && <div className="cart-backdrop" onClick={() => setOpen(false)}><aside className="cart-panel" onClick={(event) => event.stopPropagation()} aria-label="Tu pedido">
      <div className="cart-header"><div><p className="eyebrow">Tu selección</p><h2>Bolsa ({count})</h2></div><button onClick={() => setOpen(false)} aria-label="Cerrar"><X/></button></div>
      {cart.length === 0 ? <div className="empty-cart"><ShoppingBag/><h3>Tu bolsa está vacía</h3><p>Elige unas flores y volverán contigo.</p></div> : <>
        <div className="cart-lines">{cart.map((item) => <div className="cart-line" key={item.id}><div className="cart-thumb"><img src={`/api/products/${item.id}/image`} alt=""/></div><div><h3>{item.name}</h3><p>S/ {item.price}</p><div className="quantity"><button onClick={() => change(item.id, -1)}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => change(item.id, 1)}><Plus size={14}/></button></div></div></div>)}</div>
        <div className="cart-total"><span>Total</span><strong>S/ {total}</strong></div>
        <a className="checkout" href={`https://wa.me/51999999999?text=${orderText}`}><Check size={18}/> Pedir por WhatsApp</a>
      </>}
    </aside></div>}
  </>;
}

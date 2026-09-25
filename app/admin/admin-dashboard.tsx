"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ImagePlus, Package, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { toast, Toaster } from "sonner";

export type AdminProduct = { id: number; name: string; description: string; price: number; stock: number; category: string; season: string; featured: number; active: number };
const empty = { name: "", description: "", price: 0, stock: 0, category: "Ramos", season: "Todo el año", featured: false };

export default function AdminDashboard({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const visible = useMemo(() => products.filter((p) => p.active && p.name.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const stock = visible.reduce((sum, product) => sum + product.stock, 0);
  const soldOut = visible.filter((product) => product.stock === 0).length;

  useEffect(() => {
    const context = typeof document === "undefined" ? undefined : (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: unknown) => void } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    context.registerTool({ name: "update_flower_stock", title: "Actualizar stock", description: "Actualiza el stock visible de un producto de la florería.", inputSchema: { type: "object", properties: { id: { type: "number" }, stock: { type: "number", minimum: 0 } }, required: ["id", "stock"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async (input: unknown) => { const value = input as { id: number; stock: number }; const product = products.find((p) => p.id === value.id); if (!product) throw new Error("Producto no encontrado"); const updated = { ...product, stock: value.stock }; await save(updated); return { id: value.id, stock: value.stock, status: value.stock === 0 ? "agotado" : "disponible" }; } }, { signal: lifecycle.signal });
    return () => lifecycle.abort();
  }, [products]);

  async function save(product: AdminProduct) {
    const response = await fetch("/api/products", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(product) });
    if (!response.ok) throw new Error("No se pudo guardar");
    setProducts((current) => current.map((item) => item.id === product.id ? product : item));
  }

  function openCreate() { setForm(empty); setEditing(null); setImageFile(null); setImagePreview(null); setCreating(true); }
  function openEdit(product: AdminProduct) { setEditing(product); setImageFile(null); setImagePreview(`/api/products/${product.id}/image`); setForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, category: product.category, season: product.season, featured: Boolean(product.featured) }); setCreating(true); }

  function selectImage(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Usa una imagen JPG, PNG o WebP');
    if (file.size > 5 * 1024 * 1024) return toast.error('La imagen debe pesar menos de 5 MB');
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const method = editing ? "PATCH" : "POST";
    const payload = editing ? { ...editing, ...form, featured: form.featured ? 1 : 0 } : form;
    const response = await fetch("/api/products", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) return toast.error("No pudimos guardar el producto");
    let productId: number;
    if (editing) { productId = editing.id; setProducts((current) => current.map((item) => item.id === editing.id ? { ...item, ...payload } as AdminProduct : item)); }
    else {
      const created = await response.json() as AdminProduct;
      productId = created.id;
      setProducts((current) => [{ ...created, active: 1 }, ...current]);
    }
    if (imageFile) {
      const upload = new FormData(); upload.append('id', String(productId)); upload.append('image', imageFile);
      const imageResponse = await fetch('/api/products/image', { method: 'POST', body: upload });
      if (!imageResponse.ok) { const error = await imageResponse.json() as { error?: string }; return toast.error(error.error ?? 'No se pudo subir la foto'); }
    }
    setCreating(false); toast.success(editing ? "Producto actualizado" : "Producto agregado");
  }

  async function adjust(product: AdminProduct, delta: number) {
    const updated = { ...product, stock: Math.max(0, product.stock + delta) };
    try { await save(updated); toast.success(`Stock de ${product.name}: ${updated.stock}`); } catch { toast.error("No se pudo actualizar el stock"); }
  }

  async function remove(product: AdminProduct) {
    if (!confirm(`¿Ocultar ${product.name} de la tienda?`)) return;
    const response = await fetch(`/api/products?id=${product.id}`, { method: "DELETE" });
    if (response.ok) { setProducts((current) => current.map((item) => item.id === product.id ? { ...item, active: 0 } : item)); toast.success("Producto ocultado"); }
  }

  return <>
    <Toaster richColors position="top-right"/>
    <div className="admin-heading"><div><p className="eyebrow">Panel de control</p><h1>Inventario floral</h1><p>Actualiza productos, existencias y colecciones de temporada.</p></div><button className="admin-primary" onClick={openCreate}><Plus size={18}/> Nuevo producto</button></div>
    <div className="stat-grid"><div><Package/><p><span>Unidades disponibles</span><strong>{stock}</strong></p></div><div><AlertTriangle/><p><span>Productos agotados</span><strong>{soldOut}</strong></p></div><div><Sparkles/><p><span>De temporada</span><strong>{visible.filter((p) => p.season !== "Todo el año").length}</strong></p></div></div>
    <section className="inventory-card" id="inventario">
      <div className="inventory-toolbar"><div><h2>Productos</h2><span>{visible.length} activos</span></div><label><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto…"/></label></div>
      <div className="inventory-table"><div className="table-row table-head"><span>Producto</span><span>Temporada</span><span>Precio</span><span>Stock</span><span>Estado</span><span></span></div>{visible.map((product) => <div className="table-row" key={product.id}>
        <div className="table-product"><span><img src={`/api/products/${product.id}/image`} alt=""/></span><p><strong>{product.name}</strong><small>{product.category}</small></p></div>
        <span className="season-cell">{product.season}</span><strong>S/ {product.price}</strong>
        <div className="stock-control"><button onClick={() => adjust(product, -1)}>−</button><span>{product.stock}</span><button onClick={() => adjust(product, 1)}>+</button></div>
        <span className={product.stock === 0 ? "status out" : product.stock < 4 ? "status low" : "status ok"}>{product.stock === 0 ? "AGOTADO" : product.stock < 4 ? "Stock bajo" : "Disponible"}</span>
        <div className="row-actions"><button onClick={() => openEdit(product)} aria-label="Editar"><Pencil size={16}/></button><button onClick={() => remove(product)} aria-label="Ocultar"><Trash2 size={16}/></button></div>
      </div>)}</div>
    </section>
    {creating && <div className="modal-backdrop"><div className="product-modal"><div className="modal-head"><div><p className="eyebrow">{editing ? "Editar" : "Nuevo"}</p><h2>{editing ? editing.name : "Agregar producto"}</h2></div><button onClick={() => setCreating(false)}><X/></button></div><form onSubmit={submit}>
      <label className="image-upload full"><span>Foto del producto</span><div className="image-drop">{imagePreview ? <img src={imagePreview} alt="Vista previa"/> : <><ImagePlus/><strong>Seleccionar imagen</strong><small>JPG, PNG o WebP · máximo 5 MB</small></>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => selectImage(e.target.files?.[0])}/></div></label>
      <label>Nombre<input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}/></label>
      <label className="full">Descripción<textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}/></label>
      <label>Precio (S/)<input required min="0" type="number" value={form.price} onChange={(e) => setForm({...form, price: Number(e.target.value)})}/></label>
      <label>Stock<input required min="0" type="number" value={form.stock} onChange={(e) => setForm({...form, stock: Number(e.target.value)})}/></label>
      <label>Categoría<select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}><option>Ramos</option><option>Cajas</option><option>Silvestres</option><option>Plantas</option></select></label>
      <label>Temporada<input value={form.season} onChange={(e) => setForm({...form, season: e.target.value})} placeholder="Ej. Flores amarillas"/></label>
      <label className="checkbox full"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured: e.target.checked})}/> Mostrar como producto destacado</label>
      <div className="modal-actions full"><button type="button" onClick={() => setCreating(false)}>Cancelar</button><button className="admin-primary" type="submit">Guardar producto</button></div>
    </form></div></div>}
  </>;
}

# Petala

Tienda web de flores con catálogo público y panel privado para administrar productos, stock, temporadas e imágenes.

## Desarrollo local

Requisitos: Node.js 22 o superior y PostgreSQL.

1. Copia `.env.example` como `.env.local` y reemplaza las credenciales.
2. Ejecuta `npm run db:local` para usar el PostgreSQL local incluido en Windows, o configura un `DATABASE_URL` externo y ejecuta `npm run db:migrate`.
3. En otra terminal ejecuta `npm run dev`.
4. Abre `http://127.0.0.1:5173`. El acceso privado está en `/login`.

## Variables de producción

- `DATABASE_URL`: conexión PostgreSQL protegida (nunca debe usar el prefijo `NEXT_PUBLIC_`).
- `ADMIN_EMAIL`: correo del administrador inicial.
- `ADMIN_NAME`: nombre mostrado en el panel.
- `ADMIN_PASSWORD`: contraseña que crea o actualiza la migración.

## Despliegue

Configura las cuatro variables anteriores en Netlify y ejecuta `npm run db:migrate` una vez contra la base PostgreSQL de producción. Conecta la rama `main` para producción; la rama `dev` queda disponible para desarrollo y despliegues de prueba.

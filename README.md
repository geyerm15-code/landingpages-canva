# Generador de Landing Page (Elementor JSON)

App privada (requiere login) para subir secciones de un diseño de Canva
(mobile + desktop, imagen o video) y exportar un archivo `.json` listo
para importar en Elementor. Los usuarios se crean solo desde un dashboard
de administración — no hay registro público.

## Cómo funciona

- **Acceso:** cerrado. `middleware.ts` exige sesión iniciada en cualquier
  ruta, salvo `/login`. No existe pantalla de registro.
- **Usuarios:** viven en una tabla Postgres, gestionados desde
  `/dashboard/users` (solo accesible para el rol `admin`).
- **Primer admin:** se crea automáticamente la primera vez que alguien
  inicia sesión con el email/contraseña definidos en `ADMIN_EMAIL` /
  `ADMIN_PASSWORD`, y solo si la tabla de usuarios está vacía. De ahí en
  más, ese admin crea el resto de las cuentas desde el dashboard.
- Cada archivo se sube **directo del navegador a Cloudinary** (no pasa por
  Vercel), así que no hay límites de tamaño de payload ni de tiempo de
  ejecución de funciones serverless.
- El JSON de Elementor se genera **100% en el navegador** con
  `lib/elementor-generator.ts`.

## 1. Configurar Cloudinary (gratis)

1. Crear cuenta en https://cloudinary.com
2. Ir a **Settings → Upload → Upload presets → Add upload preset**
3. Signing Mode: **Unsigned**
4. (Recomendado) Folder: `misto-landing/`
5. (Recomendado) Restringir formatos permitidos: `jpg,png,webp,mp4`
6. Copiar el **Cloud name** y el **nombre del preset**.

## 2. Configurar la base de datos (Vercel Postgres)

1. En el dashboard de tu proyecto en Vercel, andá a la pestaña **Storage**
2. **Create Database → Postgres** (plan gratuito Hobby alcanza de sobra)
3. **Connect to Project** → seleccioná este proyecto
4. Vercel inyecta automáticamente las variables `POSTGRES_URL` y demás en
   tu proyecto. No necesitás correr ninguna migración a mano: la tabla
   `users` se crea sola la primera vez que la app la necesita.
5. Para trabajar en local, andá a **Storage → tu base → .env.local** y
   copiá esas variables a tu `.env.local`.

## 3. Configurar variables de entorno

Copiar `.env.local.example` a `.env.local` y completar:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-preset-unsigned

NEXTAUTH_SECRET=       # generar con: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

ADMIN_EMAIL=admin@tuempresa.com
ADMIN_PASSWORD=una-contraseña-fuerte

POSTGRES_URL=...       # copiado desde Vercel Storage
```

## 4. Correr en local

```bash
npm install
npm run dev
```

Abrir http://localhost:3000 — te va a redirigir a `/login`. Iniciá sesión
con `ADMIN_EMAIL` / `ADMIN_PASSWORD`: eso crea automáticamente tu primer
usuario admin en la base. A partir de ahí, andá a **Usuarios** (arriba a
la derecha) para crear el resto de las cuentas.

## 5. Desplegar en Vercel

```bash
npm install -g vercel
vercel
```

O conectar el repo desde https://vercel.com/new. En **Project Settings →
Environment Variables** agregar TODAS las variables del paso 3 (incluidas
`NEXTAUTH_SECRET`, `NEXTAUTH_URL` con tu dominio real de producción, y
`ADMIN_EMAIL`/`ADMIN_PASSWORD`).

## Próximos pasos (no incluidos todavía)

- Editor de anotaciones para marcar títulos/textos sobre el preview y
  convertirlos en widgets `heading`/`text-editor` editables.
- Reordenar páginas con drag & drop (hoy se usan flechas ↑/↓).
- Guardar cada landing page como proyecto en la base de datos, asociado al
  usuario que lo creó, para poder retomarlo después.
- Recuperación de contraseña por email (hoy el admin tiene que borrar y
  recrear la cuenta si alguien la olvida).


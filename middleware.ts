import { withAuth } from "next-auth/middleware";

// Se le pasa explícitamente pages.signIn para que el middleware redirija
// directo a /login sin tener que resolver internamente ninguna URL de
// configuración de NextAuth (eso era lo que probablemente disparaba el
// mismo error "Invalid URL" que vimos durante el build, pero ahora en
// cada request real).
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protege TODA la app excepto: /login, las rutas de NextAuth, y los
// assets estáticos de Next. Cualquier otra ruta redirige a /login si no
// hay sesión iniciada. Esto es lo que hace que la plataforma no sea pública.
export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};

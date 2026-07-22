import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, createUser, countUsers } from "./db";
import { hashPassword, verifyPassword } from "./password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const email = credentials.email.toLowerCase().trim();

        let user = await getUserByEmail(email);

        if (!user) {
          // Bootstrap: si todavía no hay NINGÚN usuario en la base y las
          // credenciales coinciden con ADMIN_EMAIL/ADMIN_PASSWORD, se crea
          // automáticamente el primer administrador. Después de esto, ese
          // camino nunca se vuelve a usar (countUsers ya no da 0).
          const existing = await countUsers();
          const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (
            existing === 0 &&
            adminEmail &&
            adminPassword &&
            email === adminEmail &&
            credentials.password === adminPassword
          ) {
            const passwordHash = await hashPassword(adminPassword);
            user = await createUser({ email, passwordHash, name: "Admin", role: "admin" });
          } else {
            return null;
          }
        } else {
          const valid = await verifyPassword(credentials.password, user.password_hash);
          if (!valid) return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "admin" | "user" }).role;
        token.id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "admin" | "user";
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

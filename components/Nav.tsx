"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session) return null;

  const role = session.user.role;

  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <Link href="/" className="nav-brand">
          Generador de Landing Page
        </Link>
        <div className="nav-links">
          {role === "admin" && <Link href="/dashboard/users">Usuarios</Link>}
          <span className="nav-user">{session.user.email}</span>
          <button type="button" className="nav-logout" onClick={() => signOut({ callbackUrl: "/login" })}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

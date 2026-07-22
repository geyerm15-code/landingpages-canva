import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import UsersManager from "@/components/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const users = await listUsers();

  return (
    <main className="container">
      <header className="app-header">
        <h1>Usuarios</h1>
        <p className="subtitle">Crear y administrar quién tiene acceso a la plataforma.</p>
      </header>

      <UsersManager initialUsers={users} currentUserId={session.user.id} />
    </main>
  );
}

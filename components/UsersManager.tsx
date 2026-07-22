"use client";

import { useState, type FormEvent } from "react";
import type { SafeUser } from "@/lib/db";

interface UsersManagerProps {
  initialUsers: SafeUser[];
  currentUserId: string;
}

export default function UsersManager({ initialUsers, currentUserId }: UsersManagerProps) {
  const [users, setUsers] = useState<SafeUser[]>(initialUsers);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el usuario");
      }

      setUsers((prev) => [data.user, ...prev]);
      setEmail("");
      setName("");
      setPassword("");
      setRole("user");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este usuario? No va a poder volver a iniciar sesión.")) return;

    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "No se pudo eliminar el usuario");
    }
  }

  return (
    <div>
      <form className="user-form" onSubmit={handleCreate}>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Nombre (opcional)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "user")}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {error && <p className="upload-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creando…" : "+ Crear usuario"}
        </button>
      </form>

      <table className="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Creado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.name || "—"}</td>
              <td>{u.role === "admin" ? "Administrador" : "Usuario"}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {u.id !== currentUserId && (
                  <button type="button" className="btn-danger" onClick={() => handleDelete(u.id)}>
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

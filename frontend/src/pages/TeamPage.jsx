import { useEffect, useState } from "react";
import { apiJson } from "../api.js";
export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  async function loadMembers() {
    setError("");
    try {
      const data = await apiJson("/api/members/");
      setMembers(Array.isArray(data) ? data : data?.results ?? []);
    } catch (e) {
      setError(e.message ?? String(e));
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const loginId = email.trim();
    if (!loginId || password.length < 8) return;
    try {
      await apiJson("/api/admin/users/", {
        method: "POST",
        body: JSON.stringify({
          username: loginId,
          email: loginId,
          password,
          role,
        }),
      });
      setSuccess(`Created ${role}: ${loginId}. They can sign in from the login page.`);
      setEmail("");
      setPassword("");
      setRole("member");
      loadMembers();
    } catch (e) {
      setError(e.message ?? String(e));
    }
  }

  return (
    <div className="px-4 py-10">
      <header className="mb-8 max-w-3xl">
          <h1 className="text-2xl font-semibold text-white">Admin · Users &amp; roles</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Only <strong className="text-slate-300">Administrators</strong> see this page. Use it to invite{" "}
            <strong className="text-indigo-300">member</strong> or <strong className="text-indigo-300">admin</strong>{" "}
            accounts (same login form as Sign in). Typical eval flow: add a{" "}
            <strong className="text-white">member</strong> → log out → sign in as that member.
          </p>
      </header>

      {success && (
        <div className="mb-6 rounded-lg border border-emerald-900/80 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg bg-red-950/40 px-4 py-2 text-sm text-red-300">{error}</div>
      )}

      <section className="mx-auto mb-10 max-w-3xl rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium text-white">Add user</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Login ID (email)
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              autoComplete="off"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Temporary password (min 8 characters)
            <input
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Role
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Create user
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-lg font-medium text-white">Accounts</h2>
        {loadingList ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/40">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <span className="font-medium text-slate-100">{m.email || m.username}</span>
                  <span className="ml-2 text-xs text-slate-500">{m.username}</span>
                </div>
                <span
                  className={
                    m.role === "admin"
                      ? "rounded-full bg-indigo-950 px-2 py-0.5 text-xs text-indigo-300"
                      : "rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
                  }
                >
                  {m.role}
                </span>
              </li>
            ))}
            {members.length === 0 && (
              <li className="px-4 py-8 text-center text-slate-500">No users yet.</li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

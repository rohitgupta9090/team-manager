import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const navInactive =
  "rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white";

function navActive({ isActive }) {
  const base =
    "rounded-lg px-3 py-2 text-sm font-medium transition border border-transparent";
  if (isActive) return `${base} border-indigo-500/60 bg-indigo-950/50 text-white`;
  return `${base} ${navInactive}`;
}

export default function MainLayout() {
  const { user, loading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <NavLink to="/" className="mr-2 shrink-0 font-semibold tracking-tight text-white">
            Team Task Manager
          </NavLink>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navActive}>
              Dashboard
            </NavLink>
            {isAdmin && (
              <NavLink to="/team" className={navActive}>
                Admin · Users &amp; roles
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                isAdmin
                  ? "bg-indigo-600/25 text-indigo-200 ring-indigo-500/40"
                  : "bg-slate-700/60 text-slate-300 ring-slate-600"
              }`}
              title="Your RBAC role in this app."
            >
              {isAdmin ? "Administrator" : "Member"}
            </span>
            <span className="hidden truncate text-sm text-slate-400 sm:inline md:max-w-[14rem]" title={user.email}>
              {user.name || user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Log out →
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "../api.js";
import RoleDemoHints from "../components/RoleDemoHints.jsx";
import { useAuth } from "../auth.jsx";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [overdueItems, setOverdueItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const dash = await apiJson("/api/dashboard/");
      const projectsData = await apiJson("/api/projects/");
      setStats({
        total_tasks: dash.total_tasks,
        completed_tasks: dash.completed_tasks,
        pending_tasks: dash.pending_tasks,
        overdue_count: dash.overdue_count ?? 0,
      });
      setOverdueItems(Array.isArray(dash.overdue_items) ? dash.overdue_items : []);
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData?.results ?? []);
    } catch (e) {
      setError(e.message ?? String(e));
    }
  }

  useEffect(() => {
    if (!user) return;
    load();
  }, [user?.id, user?.role, isAdmin]);

  async function createProject(e) {
    e.preventDefault();
    if (!newProject.trim()) return;
    setError("");
    try {
      await apiJson("/api/projects/", {
        method: "POST",
        body: JSON.stringify({ name: newProject.trim() }),
      });
      setNewProject("");
      load();
    } catch (e) {
      setError(e.message ?? String(e));
    }
  }

  return (
    <div className="px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Snapshot of task activity
          {isAdmin ? (
            <> — as <span className="font-medium text-indigo-400">Administrator</span> you manage users, projects,
            and assignments.</>
          ) : (
            <> — as a <span className="font-medium text-slate-300">Member</span> these numbers include only tasks
            assigned to you ({user?.name || user?.email}).</>
          )}
        </p>
      </header>

      <RoleDemoHints />

      {error && (
        <div className="mb-6 rounded-lg bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total tasks</p>
              <p className="mt-1 text-3xl font-semibold text-white">{stats.total_tasks}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-400">
                {stats.completed_tasks}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Pending</p>
              <p className="mt-1 text-3xl font-semibold text-amber-400">
                {stats.pending_tasks}
              </p>
            </div>
            <div
              className={`rounded-xl border p-5 ${stats.overdue_count > 0 ? "border-rose-800/70 bg-rose-950/30" : "border-slate-800 bg-slate-900/50"}`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">Overdue</p>
              <p className="mt-1 text-3xl font-semibold text-rose-400">
                {stats.overdue_count ?? 0}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Due date passed and not marked done ({isAdmin ? "all tasks" : "your assigned tasks"})
              </p>
            </div>
          </div>

          {overdueItems.length > 0 && (
            <section className="mb-10 rounded-xl border border-rose-900/40 bg-rose-950/20 p-5">
              <h2 className="mb-3 text-lg font-medium text-rose-100">Overdue items</h2>
              <ul className="space-y-2 text-sm">
                {overdueItems.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      to={`/project/${item.project_id}`}
                      className="text-indigo-300 hover:underline"
                    >
                      {item.title}
                    </Link>
                    <span className="text-slate-400">
                      {item.project_name} · due {item.due_date}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Projects</h2>
        </div>

        {isAdmin && (
          <form onSubmit={createProject} className="mb-6 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
              placeholder="New project name"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Create
            </button>
          </form>
        )}

        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                to={`/project/${p.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 transition hover:border-slate-600 hover:bg-slate-900/70"
              >
                <span className="font-medium text-slate-100">{p.name}</span>
                <span className="text-xs text-slate-500">open →</span>
              </Link>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-slate-500">
              No projects yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

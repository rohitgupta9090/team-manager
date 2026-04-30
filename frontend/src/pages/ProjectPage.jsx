import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiJson } from "../api.js";
import { useAuth } from "../auth.jsx";

const STATUS_OPTIONS = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export default function ProjectPage() {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [nameByUserId, setNameByUserId] = useState({});
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const project = await apiJson(`/api/projects/${id}/`);
      setProjectName(project?.name || "Project");

      const taskRows = await apiJson(`/api/tasks/?project_id=${encodeURIComponent(id)}`);
      const list = Array.isArray(taskRows) ? taskRows : taskRows?.results ?? [];
      setTasks(list);

      const ids = [...new Set(list.map((t) => t.assigned_to).filter(Boolean))];
      if (ids.length) {
        const membersRaw = await apiJson("/api/members/");
        const memList = Array.isArray(membersRaw) ? membersRaw : membersRaw?.results ?? [];
        const map = {};
        memList.forEach((m) => {
          map[m.id] = m.name || m.username || String(m.id);
        });
        ids.forEach((uid) => {
          if (!map[uid]) map[uid] = String(uid);
        });
        if (user?.id) {
          map[user.id] = map[user.id] || user.name || user.email || String(user.id);
        }
        setNameByUserId(map);
      } else {
        setNameByUserId({});
      }

      if (isAdmin) {
        const membersRaw = await apiJson("/api/members/");
        const m = Array.isArray(membersRaw) ? membersRaw : membersRaw?.results ?? [];
        setMembers(m);
        setAssignedTo((prev) => prev || (m.length ? String(m[0].id) : ""));
      }
    } catch (e) {
      setError(e.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin, user?.id, user?.name, user?.email]);

  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assigned_to === user?.id);

  const canEditStatus = (task) => task.assigned_to === user?.id || isAdmin;

  async function createTask(e) {
    e.preventDefault();
    if (!title.trim() || !assignedTo) return;
    setError("");
    try {
      const body = {
        title: title.trim(),
        description: description || "",
        status: "todo",
        assigned_to: Number(assignedTo),
        project: Number(id),
      };
      if (dueDate) body.due_date = dueDate;
      await apiJson("/api/tasks/", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      load();
    } catch (e) {
      setError(e.message ?? String(e));
    }
  }

  async function updateStatus(taskId, status) {
    setError("");
    try {
      await apiJson(`/api/tasks/${taskId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e) {
      setError(e.message ?? String(e));
    }
  }

  return (
    <div className="px-4 py-10">
      <nav className="mb-6 text-xs text-slate-500">
        Use <strong className="text-slate-400">Dashboard</strong> or <strong className="text-slate-400">Team Task Manager</strong> in the{" "}
        top bar for navigation · <span className="text-slate-600">currently viewing a single project.</span>
      </nav>

      <h1 className="mb-5 text-2xl font-semibold text-white">{projectName}</h1>

      {isAdmin ? (
        <div className="mb-6 rounded-xl border border-indigo-900/70 bg-indigo-950/40 px-4 py-3 text-sm text-indigo-100">
          <strong className="text-white">Administrator view.</strong> Create tasks below and pick who they are assigned
          to. You can edit any task status.
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
          <strong className="text-white">Member view.</strong> You only see tasks assigned to{" "}
          <span className="text-indigo-300">{user?.name || user?.email}</span>. Change Status only on your own rows.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {isAdmin && (
        <form
          onSubmit={createTask}
          className="mb-10 space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <h2 className="text-sm font-medium text-slate-300">Create task</h2>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
            placeholder="Description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <label className="block flex-1 min-w-[140px] text-xs text-slate-400">
              Assign to
              <select
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.username} ({m.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1 min-w-[140px] text-xs text-slate-400">
              Due date
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add task
          </button>
        </form>
      )}

      <h2 className="mb-4 text-lg font-medium text-white">Tasks</h2>
      <ul className="space-y-3">
        {visibleTasks.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-100">{t.title}</p>
                {t.description && (
                  <p className="mt-1 text-sm text-slate-400">{t.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Assigned: {nameByUserId[t.assigned_to] || "…"}
                  {t.due_date && ` · Due ${t.due_date}`}
                </p>
              </div>
              <label className="flex flex-col text-xs text-slate-400">
                Status
                <select
                  className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                  value={t.status}
                  onChange={(e) => updateStatus(t.id, e.target.value)}
                  disabled={!canEditStatus(t)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </li>
        ))}
        {visibleTasks.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-800 py-10 text-center text-slate-500">
            No tasks in this project.
          </li>
        )}
      </ul>
    </div>
  );
}

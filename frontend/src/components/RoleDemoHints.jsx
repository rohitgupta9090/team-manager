import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";

/** Collapsible workflow for graders testing Admin vs Member. */
export default function RoleDemoHints() {
  const { isAdmin } = useAuth();

  return (
    <details className="group mb-8 rounded-xl border border-amber-800/60 bg-gradient-to-br from-amber-950/50 to-slate-900/80 p-4 text-sm shadow-lg shadow-black/20 open:pb-5">
      <summary className="cursor-pointer select-none font-semibold text-amber-100 marker:text-amber-400">
        Evaluate admin vs member flows (click to open or close this guide)
      </summary>
      <div className="mt-4 space-y-4 text-slate-300">
        <p className="text-xs text-slate-500">
          Your badge in the top bar shows whether this session is{" "}
          <strong className="text-slate-300">Administrator</strong> or{" "}
          <strong className="text-slate-300">Member</strong>.
        </p>

        {isAdmin ? (
          <div className="space-y-2 rounded-lg border border-indigo-900/60 bg-indigo-950/30 p-3">
            <p className="font-medium text-indigo-100">Right now you are logged in as an Administrator.</p>
            <ol className="list-decimal space-y-1 pl-5 text-slate-300">
              <li>
                Open <strong className="text-white">Admin · Users &amp; roles</strong> in the top bar → create a{" "}
                <strong className="text-white">member</strong> account (remember email &amp; password).
              </li>
              <li>
                Under <strong className="text-white">Projects</strong> below → create a project → open it.
              </li>
              <li>
                In the project → use <strong className="text-white">Assign to</strong> to assign tasks to your new
                member.
              </li>
              <li>
                Click <strong className="text-white">Log out →</strong>, then <strong className="text-white">Sign in</strong> with{" "}
                your member credentials and select the{" "}
                <strong className="text-white">Member</strong> radio (must match stored role).
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-medium text-slate-100">Right now you are logged in as a Member.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Dashboard shows stats <strong className="text-white">only for tasks assigned to you</strong>.
              </li>
              <li>
                Under <strong className="text-white">Projects</strong>, open a project — you&apos;ll see only{" "}
                <strong className="text-white">tasks assigned to you</strong>; use the Status control on those rows.
              </li>
              <li>
                <strong className="text-white">User management</strong> stays off the top bar unless you&apos;re logged in
                as an <strong className="text-white">Administrator</strong> — that mirrors the assignment&apos;s RBAC.
              </li>
              <li>
                To test as admin again:{" "}
                <Link className="text-indigo-400 underline" to="/login">
                  Log out
                </Link>{" "}
                and sign in with the <strong className="text-white">Administrator</strong> radio selected.
              </li>
            </ol>
          </div>
        )}
      </div>
    </details>
  );
}

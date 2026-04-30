import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AccountTypeRadios } from "../components/AccountTypeRadios.jsx";
import { loginWithPassword } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { accessError, clearAccessError, refreshUser, setAuthTokens } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  useEffect(() => {
    if (accessError) setError(accessError);
  }, [accessError]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    clearAccessError();
    const id = loginId.trim();
    try {
      const data = await loginWithPassword(id, password, role);
      setAuthTokens(data.access, data.refresh);
      await refreshUser();
      navigate("/");
    } catch (err) {
      setError(err.message ?? String(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-semibold text-white">Sign in</h1>
      
      <details className="group mb-6 rounded-xl border border-slate-700/80 bg-slate-900/40 px-4 py-3 text-sm text-slate-400 open:shadow-md">
        
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-slate-400">
          <li>Select the role those credentials were issued with.</li>
          <li>
            If you created the account yourself, use the matching choice from <strong>Create account</strong>.
          </li>
          <li>
            Invitation from <strong>Admin · Users &amp; roles</strong> uses whatever role there was picked for you — match
            that here.
          </li>
          <li>
            Selecting the wrong radio shows a mismatch error rather than silently logging you in with the wrong
            assumptions.
          </li>
        </ol>
      </details>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        {error && (
          <div className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}
        <AccountTypeRadios idPrefix="in-" legend="Signing in as" value={role} onChange={setRole} />
        <label className="block text-sm text-slate-300">
          Login ID
          <input
            type="email"
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="you@example.com"
            required
          />

          {/* hhh */}
          <span className="mt-1 block text-xs text-slate-500">
            Same email you used during sign-up / invitation.
          </span>
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          Sign in
        </button>
        <Link
          to="/signup"
          className="block w-full rounded-lg border border-slate-600 bg-slate-900 py-2.5 text-center text-sm font-medium text-slate-200 hover:border-indigo-500 hover:text-white"
        >
          Create account
        </Link>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account yet? Pick <strong className="text-slate-400">Member</strong> or{" "}
        <strong className="text-slate-400">Administrator</strong> on <strong>Create account</strong> first.
      </p>
    </div>
  );
}

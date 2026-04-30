import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AccountTypeRadios } from "../components/AccountTypeRadios.jsx";
import { loginWithPassword, signupRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { refreshUser, setAuthTokens } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const loginId = email.trim();
    if (!loginId) return;

    try {
      await signupRequest({
        username: loginId,
        email: loginId,
        password,
        role,
      });
      const data = await loginWithPassword(loginId, password, role);
      setAuthTokens(data.access, data.refresh);
      await refreshUser();
      navigate("/");
    } catch (err) {
      setError(err.message ?? String(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-semibold text-white">Create account</h1>
      <div className="mb-8 space-y-2 rounded-xl border border-indigo-900/60 bg-indigo-950/30 px-4 py-4 text-sm text-slate-300">
        <p className="font-semibold text-indigo-200">How role choice works here</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-400">
          <li>
            Choose <strong className="text-white">Administrator</strong> if you expect to manage{" "}
            <strong className="text-white">projects, tasks,</strong> and users.
          </li>
          <li>
            Choose <strong className="text-white">Member</strong> for everyday contributors invited to execute tasks assigned
            to them.
          </li>
          <li>
            The server stores exactly what you select —{" "}
            <strong className="text-white">sign in later with the same role choice</strong> so it matches what we saved.
          </li>
          <li>Display name stays optional.</li>
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        {error && (
          <div className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</div>
        )}
        <AccountTypeRadios idPrefix="su-" legend="Creating this account as" value={role} onChange={setRole} />

        <label className="block text-sm text-slate-300">
          Display name
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Login ID (email)
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password (min 8 characters)
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          Sign up
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

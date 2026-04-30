/**
 * RBAC radios on login & signup ("member" | "admin").
 */
export function AccountTypeRadios({
  idPrefix = "",
  legend = "Account type",
  value,
  onChange,
}) {
  const gid = `${idPrefix}role-group`;

  return (
    <fieldset
      className="space-y-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
      role="radiogroup"
      aria-labelledby={gid}
    >
      <legend id={gid} className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {legend}
      </legend>

      <label className="flex cursor-pointer gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-slate-700 hover:bg-slate-900/80 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500">
        <input
          type="radio"
          name={`${idPrefix}account-role`}
          className="mt-1"
          checked={value === "member"}
          onChange={() => onChange("member")}
        />
        <span>
          <span className="block font-medium text-slate-100">Member</span>
          <span className="block text-xs text-slate-500">
            Dashboard and tasks assigned to you; no user-management tab for this role.
          </span>
        </span>
      </label>

      <label className="flex cursor-pointer gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-slate-700 hover:bg-slate-900/80 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500">
        <input
          type="radio"
          name={`${idPrefix}account-role`}
          className="mt-1"
          checked={value === "admin"}
          onChange={() => onChange("admin")}
        />
        <span>
          <span className="block font-medium text-indigo-200">Administrator</span>
          <span className="block text-xs text-slate-500">
            Projects, assigning tasks, and Admin · Users &amp; roles.
          </span>
        </span>
      </label>
    </fieldset>
  );
}

import { Input } from "../../../components/ui/Input.js";
import { Select } from "../../../components/ui/Select.js";
import { AUTH_OPTIONS } from "../_constants.js";
import { type AuthPreset, type AuthState, DEFAULT_AUTH } from "../_types.js";

export function AuthSection({
  auth,
  onChange,
}: {
  auth: AuthState;
  onChange: (auth: AuthState) => void;
}) {
  const updateAuth = (patch: Partial<AuthState>) =>
    onChange({ ...auth, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-24 text-zinc-500 shrink-0">Strategy</span>
        <select
          value={auth.preset}
          onChange={(event) =>
            onChange({
              ...DEFAULT_AUTH,
              preset: event.target.value as AuthPreset,
            })
          }
          className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors appearance-none cursor-pointer"
        >
          {AUTH_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#161b22]"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {auth.preset === "bearer" && (
        <div className="flex items-center gap-4">
          <span className="w-24 text-zinc-500 shrink-0 font-bold">Token</span>
          <input
            className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
            placeholder="ey..."
            value={auth.token}
            onChange={(event) => updateAuth({ token: event.target.value })}
          />
        </div>
      )}

      {auth.preset === "basic" && (
        <>
          <div className="flex items-center gap-4">
            <span className="w-24 text-zinc-500 shrink-0 font-bold">User</span>
            <input
              className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
              placeholder="username"
              value={auth.username}
              onChange={(event) => updateAuth({ username: event.target.value })}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-24 text-zinc-500 shrink-0 font-bold">Pass</span>
            <input
              className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
              placeholder="password"
              type="password"
              value={auth.password}
              onChange={(event) => updateAuth({ password: event.target.value })}
            />
          </div>
        </>
      )}

      {(auth.preset === "apiKey-header" ||
        auth.preset === "apiKey-query" ||
        auth.preset === "cookie") && (
        <>
          <div className="flex items-center gap-4">
            <span className="w-24 text-zinc-500 shrink-0 font-bold">Key</span>
            <input
              className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
              placeholder="X-API-Key"
              value={auth.keyName}
              onChange={(event) => updateAuth({ keyName: event.target.value })}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-24 text-zinc-500 shrink-0 font-bold">Value</span>
            <input
              className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
              placeholder="value"
              value={auth.keyValue}
              onChange={(event) => updateAuth({ keyValue: event.target.value })}
            />
          </div>
        </>
      )}
    </div>
  );
}

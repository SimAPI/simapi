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
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest block pl-1">
          Security Strategy
        </label>
        <div className="relative group">
          <select
            value={auth.preset}
            onChange={(event) =>
              onChange({
                ...DEFAULT_AUTH,
                preset: event.target.value as AuthPreset,
              })
            }
            className="w-full bg-zinc-50 dark:bg-white/3 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-3 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer text-zinc-900 dark:text-white font-mono text-[12px] transition-all group-hover:bg-zinc-100 dark:group-hover:bg-white/5"
          >
            {AUTH_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-white dark:bg-[#08090a]"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-zinc-50 dark:border-white/2">
        {auth.preset === "bearer" && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest block pl-1">
              Access Token
            </label>
            <input
              className="w-full bg-transparent border-b border-zinc-100 dark:border-white/5 focus:border-cyan-500/50 outline-none py-2 transition-all text-zinc-900 dark:text-white font-mono text-[12px] placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
              placeholder="ey..."
              value={auth.token}
              onChange={(event) => updateAuth({ token: event.target.value })}
            />
          </div>
        )}

        {auth.preset === "basic" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest block pl-1">
                Principal
              </label>
              <input
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/5 focus:border-cyan-500/50 outline-none py-2 transition-all text-zinc-900 dark:text-white font-mono text-[12px] placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                placeholder="id"
                value={auth.username}
                onChange={(event) =>
                  updateAuth({ username: event.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest block pl-1">
                Secret
              </label>
              <input
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/5 focus:border-cyan-500/50 outline-none py-2 transition-all text-zinc-900 dark:text-white font-mono text-[12px] placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                placeholder="pass"
                type="password"
                value={auth.password}
                onChange={(event) =>
                  updateAuth({ password: event.target.value })
                }
              />
            </div>
          </div>
        )}

        {(auth.preset === "apiKey-header" ||
          auth.preset === "apiKey-query" ||
          auth.preset === "cookie") && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest block pl-1">
                Field Key
              </label>
              <input
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/5 focus:border-cyan-500/50 outline-none py-2 transition-all text-zinc-900 dark:text-white font-mono text-[12px] placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                placeholder="X-KEY"
                value={auth.keyName}
                onChange={(event) =>
                  updateAuth({ keyName: event.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest block pl-1">
                Credential
              </label>
              <input
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/5 focus:border-cyan-500/50 outline-none py-2 transition-all text-zinc-900 dark:text-white font-mono text-[12px] placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                placeholder="value"
                value={auth.keyValue}
                onChange={(event) =>
                  updateAuth({ keyValue: event.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

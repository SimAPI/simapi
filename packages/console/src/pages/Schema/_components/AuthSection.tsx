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
        <label
          htmlFor="auth-preset"
          className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block pl-1"
        >
          Security Strategy
        </label>
        <div className="relative group">
          <select
            id="auth-preset"
            value={auth.preset}
            onChange={(event) =>
              onChange({
                ...DEFAULT_AUTH,
                preset: event.target.value as AuthPreset,
              })
            }
            className="w-full bg-secondary border border-border rounded-2xl px-5 py-3 outline-none focus:border-primary/50 appearance-none cursor-pointer text-foreground font-mono text-[12px] transition-all group-hover:bg-secondary/80"
          >
            {AUTH_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-background text-foreground"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <svg
              className="size-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label="Select arrow"
            >
              <title>Arrow</title>
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

      <div className="space-y-6 pt-4 border-t border-border/50">
        {auth.preset === "bearer" && (
          <div className="space-y-3">
            <label
              htmlFor="auth-token"
              className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block pl-1"
            >
              Access Token
            </label>
            <input
              id="auth-token"
              className="w-full bg-transparent border-b border-border focus:border-primary/50 outline-none py-2 transition-all text-foreground font-mono text-[12px] placeholder:text-muted-foreground/30"
              placeholder="ey..."
              value={auth.token}
              onChange={(event) => updateAuth({ token: event.target.value })}
            />
          </div>
        )}

        {auth.preset === "basic" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label
                htmlFor="auth-username"
                className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block pl-1"
              >
                Principal
              </label>
              <input
                id="auth-username"
                className="w-full bg-transparent border-b border-border focus:border-primary/50 outline-none py-2 transition-all text-foreground font-mono text-[12px] placeholder:text-muted-foreground/30"
                placeholder="id"
                value={auth.username}
                onChange={(event) =>
                  updateAuth({ username: event.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <label
                htmlFor="auth-password"
                className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block pl-1"
              >
                Secret
              </label>
              <input
                id="auth-password"
                className="w-full bg-transparent border-b border-border focus:border-primary/50 outline-none py-2 transition-all text-foreground font-mono text-[12px] placeholder:text-muted-foreground/30"
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
              <label
                htmlFor="auth-keyname"
                className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block pl-1"
              >
                Field Key
              </label>
              <input
                id="auth-keyname"
                className="w-full bg-transparent border-b border-border focus:border-primary/50 outline-none py-2 transition-all text-foreground font-mono text-[12px] placeholder:text-muted-foreground/30"
                placeholder="X-KEY"
                value={auth.keyName}
                onChange={(event) =>
                  updateAuth({ keyName: event.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <label
                htmlFor="auth-keyvalue"
                className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block pl-1"
              >
                Credential
              </label>
              <input
                id="auth-keyvalue"
                className="w-full bg-transparent border-b border-border focus:border-primary/50 outline-none py-2 transition-all text-foreground font-mono text-[12px] placeholder:text-muted-foreground/30"
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

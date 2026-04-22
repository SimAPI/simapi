import { Select } from "../../../components/ui/Select.js";
import { Input } from "../../../components/ui/Input.js";
import { AUTH_OPTIONS } from "../_constants.js";
import { DEFAULT_AUTH, type AuthPreset, type AuthState } from "../_types.js";

export function AuthSection({
  auth,
  onChange,
}: {
  auth: AuthState;
  onChange: (auth: AuthState) => void;
}) {
  const set = (patch: Partial<AuthState>) => onChange({ ...auth, ...patch });

  return (
    <div className="space-y-2">
      <Select
        value={auth.preset}
        onChange={(e) =>
          onChange({ ...DEFAULT_AUTH, preset: e.target.value as AuthPreset })
        }
        className="w-full"
      >
        {AUTH_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      {auth.preset === "bearer" && (
        <Input
          className="w-full"
          placeholder="Token"
          value={auth.token}
          onChange={(e) => set({ token: e.target.value })}
        />
      )}

      {auth.preset === "basic" && (
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="Username"
            value={auth.username}
            onChange={(e) => set({ username: e.target.value })}
          />
          <Input
            className="flex-1"
            placeholder="Password"
            type="password"
            value={auth.password}
            onChange={(e) => set({ password: e.target.value })}
          />
        </div>
      )}

      {(auth.preset === "apiKey-header" ||
        auth.preset === "apiKey-query" ||
        auth.preset === "cookie") && (
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="Key Name"
            value={auth.keyName}
            onChange={(e) => set({ keyName: e.target.value })}
          />
          <Input
            className="flex-1"
            placeholder="Value"
            value={auth.keyValue}
            onChange={(e) => set({ keyValue: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

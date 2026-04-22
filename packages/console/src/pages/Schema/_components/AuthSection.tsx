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
    <div className="space-y-2">
      <Select
        value={auth.preset}
        onChange={(event) =>
          onChange({
            ...DEFAULT_AUTH,
            preset: event.target.value as AuthPreset,
          })
        }
        className="w-full"
      >
        {AUTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {auth.preset === "bearer" && (
        <Input
          className="w-full"
          placeholder="Token"
          value={auth.token}
          onChange={(event) => updateAuth({ token: event.target.value })}
        />
      )}

      {auth.preset === "basic" && (
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="Username"
            value={auth.username}
            onChange={(event) => updateAuth({ username: event.target.value })}
          />
          <Input
            className="flex-1"
            placeholder="Password"
            type="password"
            value={auth.password}
            onChange={(event) => updateAuth({ password: event.target.value })}
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
            onChange={(event) => updateAuth({ keyName: event.target.value })}
          />
          <Input
            className="flex-1"
            placeholder="Value"
            value={auth.keyValue}
            onChange={(event) => updateAuth({ keyValue: event.target.value })}
          />
        </div>
      )}
    </div>
  );
}

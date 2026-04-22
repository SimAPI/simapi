export type AuthPreset =
  | "none"
  | "bearer"
  | "basic"
  | "apiKey-header"
  | "apiKey-query"
  | "cookie";

export interface AuthState {
  preset: AuthPreset;
  token: string;
  username: string;
  password: string;
  keyName: string;
  keyValue: string;
}

export const DEFAULT_AUTH: AuthState = {
  preset: "none",
  token: "",
  username: "",
  password: "",
  keyName: "x-api-key",
  keyValue: "",
};

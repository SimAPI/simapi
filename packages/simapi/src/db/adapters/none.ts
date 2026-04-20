import type { DbAdapter } from "../types.js";

export function createNoneAdapter(): DbAdapter {
  return {
    async log() {},
    async getLogs() {
      return [];
    },
    async close() {},
  };
}

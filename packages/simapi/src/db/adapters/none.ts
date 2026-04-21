import type { DbAdapter } from "../types.js";

export function createNoneAdapter(): DbAdapter {
  return {
    async log() {
      return 0;
    },
    async getLogs() {
      return [];
    },
    async deleteLog() {},
    async close() {},
  };
}

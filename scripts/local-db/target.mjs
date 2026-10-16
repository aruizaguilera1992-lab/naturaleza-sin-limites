// This module has no network or filesystem side effects.
export function validateTarget(config, database) {
  if (config.host !== "127.0.0.1" || config.port !== 55432 || config.user !== "nsl_local_admin") {
    throw new Error("Only the dedicated local PostgreSQL instance is allowed");
  }
  if (typeof config.password !== "string" || !config.password) throw new Error("Local password is required");
  if (typeof database !== "string" || !/^nsl_rebuild_[a-z0-9_]{1,45}$/.test(database)) {
    throw new Error("A new nsl_rebuild_ database name is required");
  }
  // Never forward arbitrary connection options or environment URLs.
  return { host: "127.0.0.1", port: 55432, username: "nsl_local_admin", password: config.password, database };
}

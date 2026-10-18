import test from "node:test";
import assert from "node:assert/strict";
import { validateTarget } from "./target.mjs";

const config = { host: "127.0.0.1", port: 55432, user: "nsl_local_admin", password: "synthetic-test-only" };
test("local target excludes remote endpoints, production names and forwarded options", () => {
  for (const host of ["localhost", "::1", "db.example.com", "127.0.0.1.example.com", "0.0.0.0"]) {
    assert.throws(() => validateTarget({ ...config, host }, "nsl_rebuild_test"));
  }
  assert.throws(() => validateTarget({ ...config, port: 5432 }, "nsl_rebuild_test"));
  assert.throws(() => validateTarget({ ...config, user: "postgres" }, "nsl_rebuild_test"));
  for (const database of ["postgres", "nsl_sandbox", "production", "nsl_rebuild_x;DROP DATABASE x", "nsl_rebuild_", "nsl_rebuild_" + "x".repeat(46)]) {
    assert.throws(() => validateTarget(config, database));
  }
  const target = validateTarget({ ...config, hostaddr: "remote.example", ssl: true, url: "postgres://remote" }, "nsl_rebuild_test");
  assert.deepEqual(Object.keys(target).sort(), ["database", "host", "password", "port", "username"]);
  assert.equal(target.host, "127.0.0.1");
});

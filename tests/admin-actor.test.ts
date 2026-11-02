import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAdminActor,
  createAdminActor,
} from "../src/features/admin-auth/server/actor.ts";
import * as queries from "../src/features/admin/server/queries.ts";
import * as service from "../src/features/admin/server/service.ts";

test("only actors issued by the guards pass the data-layer check", () => {
  assert.doesNotThrow(() => assertAdminActor(createAdminActor("Thanh Trà")));
  assert.throws(() => assertAdminActor(undefined), /Admin access/);
  assert.throws(() => assertAdminActor({ operator: "Ai đó" }), /Admin access/);
});

test("admin queries and services refuse to run without an actor", async () => {
  const forged = { operator: "Ai đó" } as never;
  await assert.rejects(() => queries.getDashboard(forged), /Admin access/);
  await assert.rejects(() => queries.getRequest(forged, "x"), /Admin access/);
  await assert.rejects(
    () => service.setLearnerNote("x", "note", forged),
    /Admin access/,
  );
  await assert.rejects(
    () =>
      service.createConnection(
        { requestId: "x", tutorId: "y", note: "" },
        forged,
      ),
    /Admin access/,
  );
});

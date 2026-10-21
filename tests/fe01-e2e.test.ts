import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import test from "node:test";

import { LearnerRequest } from "../lib/learner-request-model.ts";

async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No local test port");
  const port = address.port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}

async function waitUntilReady(url: string, child: ChildProcess) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Next.js exited with code ${child.exitCode}`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* The server has not opened its port yet. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Next.js did not become ready");
}

test(
  "public request is persisted and appears in the private dashboard",
  { timeout: 60_000 },
  async () => {
    const mongo = await MongoMemoryServer.create();
    const port = await availablePort();
    const base = `http://127.0.0.1:${port}`;
    const password = randomBytes(24).toString("hex");
    const child = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          MONGODB_URI: mongo.getUri("gsnm_e2e"),
          ADMIN_PASSWORD: password,
          ADMIN_SESSION_SECRET: randomBytes(48).toString("hex"),
        },
        stdio: "ignore",
      },
    );

    try {
      await waitUntilReady(base, child);

      const unauthenticated = await fetch(`${base}/admin`, {
        redirect: "manual",
      });
      assert.equal(unauthenticated.status, 307);

      const intake = await fetch(`${base}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Nguyễn An Bình",
          email: "binh@example.com",
          phone: "",
          preferredChannel: "email",
          goal: "communication",
          currentLevel: "basic",
          concerns: ["schedule"],
          format: "either",
          startTime: "within_month",
          budgetMax: 150000,
          availabilitySlots: ["weekday_evening"],
          availabilityNote: "Tối thứ hai và thứ tư",
          location: "Ninh Kiều",
          notes: "",
          consent: true,
          website: "",
        }),
      });
      assert.equal(intake.status, 201);
      const { referenceCode } = await intake.json();
      assert.match(referenceCode, /^GSNM-\d{8}-[A-F0-9]{8}$/);

      await mongoose.connect(mongo.getUri("gsnm_e2e"));
      const saved = await LearnerRequest.findOne({ referenceCode }).lean();
      assert.equal(saved?.fullName, "Nguyễn An Bình");
      assert.ok(saved?.consentAt);

      const tutor = await fetch(`${base}/api/tutor-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Trần Minh Thư",
          email: "",
          phone: "0901234567",
          preferredChannel: "zalo",
          teachingAreas: ["communication"],
          learnerLevels: ["basic"],
          experience: "one_to_two",
          experienceNote: "Hai năm dạy giao tiếp cho sinh viên.",
          certificates: "IELTS 7.5",
          format: "online",
          area: "",
          availabilitySlots: ["weekend_morning"],
          expectedFee: null,
          consent: true,
          website: "",
        }),
      });
      assert.equal(tutor.status, 201);
      assert.match(
        (await tutor.json()).referenceCode,
        /^GSNM-GS-\d{8}-[A-F0-9]{8}$/,
      );

      const login = await fetch(`${base}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get("set-cookie")?.split(";")[0];
      assert.ok(cookie);

      const dashboard = await fetch(`${base}/admin`, {
        headers: { Cookie: cookie },
      });
      assert.equal(dashboard.status, 200);
      assert.ok((await dashboard.text()).includes(referenceCode));
    } finally {
      child.kill();
      await mongoose.disconnect();
      await mongo.stop();
    }
  },
);

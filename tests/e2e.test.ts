import mongoose from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";

import { LearnerRequest } from "../src/features/learner-requests/server/model.ts";
import { startTestApp } from "./support/next-server.ts";

test(
  "public request is persisted and appears in the private dashboard",
  { timeout: 90_000 },
  async () => {
    const app = await startTestApp();
    try {
      const unauthenticated = await fetch(`${app.base}/admin`, {
        redirect: "manual",
      });
      assert.equal(unauthenticated.status, 307);

      const intake = await fetch(`${app.base}/api/requests`, {
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

      await mongoose.connect(app.mongoUri);
      const saved = await LearnerRequest.findOne({ referenceCode }).lean();
      assert.equal(saved?.fullName, "Nguyễn An Bình");
      assert.ok(saved?.consentAt);

      const tutor = await fetch(`${app.base}/api/tutor-applications`, {
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

      const { response: login, cookie } = await app.login();
      assert.equal(login.status, 200);
      assert.ok(cookie);

      const dashboard = await fetch(`${app.base}/admin`, {
        headers: { Cookie: cookie },
      });
      assert.equal(dashboard.status, 200);
      assert.ok((await dashboard.text()).includes(referenceCode));
    } finally {
      await mongoose.disconnect();
      await app.stop();
    }
  },
);

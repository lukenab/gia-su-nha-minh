import mongoose from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";

import { LearnerRequest } from "../src/features/learner-requests/server/model.ts";
import { TutorApplication } from "../src/features/tutor-applications/server/model.ts";
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
          area: "Ninh Kiều",
          acceptingStudents: true,
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
          email: "thu@example.com",
          phone: "0901234567",
          phoneHasZalo: true,
          education: "bachelor",
          school: "Trường Đại học Cần Thơ – Ngôn ngữ Anh",
          certificateList: [{ type: "ielts", name: "", score: "7.5" }],
          teachingAreas: ["communication"],
          otherTeachingArea: "",
          learnerLevels: ["basic"],
          experience: "one_to_two",
          format: "online",
          area: "",
          availabilitySlots: ["weekend_morning"],
          expectedFee: null,
          bio: "Hai năm dạy tiếng Anh giao tiếp cho sinh viên, tập trung vào phản xạ nói qua các tình huống thực tế trong học tập và công việc. Học viên được luyện nói mỗi buổi và nhận nhận xét chi tiết.",
          photo: `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).toString("base64")}`,
          consentPrivacy: true,
          website: "",
        }),
      });
      assert.equal(tutor.status, 201);
      const tutorCode = (await tutor.json()).referenceCode;
      assert.match(tutorCode, /^GSNM-GS-\d{8}-[A-F0-9]{8}$/);
      const savedTutor = await TutorApplication.findOne({
        referenceCode: tutorCode,
      }).lean();
      assert.equal(savedTutor?.hasPhoto, true);
      assert.equal(savedTutor?.certificates, "IELTS 7.5");
      assert.equal(savedTutor?.preferredChannel, "zalo");
      assert.equal(savedTutor?.acceptingStudents, true);
      // The photo is private: no session, no image.
      const photoPath = `${app.base}/api/admin/tutors/${String(savedTutor?._id)}/photo`;
      assert.equal((await fetch(photoPath)).status, 401);

      const { response: login, cookie } = await app.login();
      assert.equal(login.status, 200);
      assert.ok(cookie);

      const dashboard = await fetch(`${app.base}/admin`, {
        headers: { Cookie: cookie },
      });
      assert.equal(dashboard.status, 200);
      assert.ok((await dashboard.text()).includes(referenceCode));

      const photo = await fetch(photoPath, { headers: { Cookie: cookie } });
      assert.equal(photo.status, 200);
      assert.equal(photo.headers.get("content-type"), "image/jpeg");
      assert.equal(photo.headers.get("cache-control"), "private, no-store");
    } finally {
      await mongoose.disconnect();
      await app.stop();
    }
  },
);

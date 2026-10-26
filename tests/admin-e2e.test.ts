import mongoose from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";

import { LearnerRequest } from "../lib/learner-request-model.ts";
import { TutorApplication } from "../lib/tutor-application-model.ts";
import { startTestApp } from "./support/next-server.ts";

const json = { "Content-Type": "application/json" };
const ID = "a".repeat(24);

test(
  "admin API rejects anonymous calls and records the operator's changes",
  { timeout: 90_000 },
  async () => {
    const app = await startTestApp();
    try {
      // Nothing is readable or writable without a session.
      const writes: [string, string, unknown][] = [
        [
          "PATCH",
          `/api/admin/requests/${ID}/status`,
          { from: "NEW", to: "CONTACTED" },
        ],
        ["PATCH", `/api/admin/requests/${ID}/note`, { note: "x" }],
        [
          "PATCH",
          `/api/admin/tutors/${ID}/status`,
          { from: "NEW", to: "REVIEWING" },
        ],
        [
          "PATCH",
          `/api/admin/tutors/${ID}/review`,
          { check: "identity", reviewed: true, note: "ok ok" },
        ],
        ["PATCH", `/api/admin/tutors/${ID}/note`, { note: "x" }],
        ["POST", "/api/admin/connections", { requestId: ID, tutorId: ID }],
        [
          "PATCH",
          `/api/admin/connections/${ID}/status`,
          { from: "REVIEWING", to: "INTRODUCED" },
        ],
      ];
      for (const [method, path, body] of writes) {
        const response = await fetch(`${app.base}${path}`, {
          method,
          headers: json,
          body: JSON.stringify(body),
        });
        assert.equal(response.status, 401, `${method} ${path}`);
      }
      for (const path of [
        "/admin",
        "/admin/requests",
        "/admin/tutors",
        "/admin/connections",
        `/admin/requests/${ID}`,
        `/admin/requests/${ID}/match`,
        `/admin/tutors/${ID}`,
        `/admin/connections/${ID}`,
      ]) {
        const response = await fetch(`${app.base}${path}`, {
          redirect: "manual",
        });
        assert.equal(response.status, 307, path);
        assert.match(response.headers.get("location") ?? "", /\/admin\/login/);
      }

      // Wrong passwords and people outside the allow-list get the same answer.
      for (const [email, secret] of [
        ["tra@example.com", "wrong-password"],
        ["someone@example.com", app.password],
      ]) {
        const denied = await app.login(email, secret);
        assert.equal(denied.response.status, 401);
      }
      // The development password route does not exist in production builds.
      const local = await fetch(`${app.base}/api/admin/local-login`, {
        method: "POST",
        headers: json,
        body: JSON.stringify({ password: app.password }),
      });
      assert.equal(local.status, 404);
      // Asking for a reset link never reveals whether the email is on the team.
      for (const email of ["tra@example.com", "stranger@example.com"]) {
        const forgot = await fetch(`${app.base}/api/admin/password/forgot`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({ email }),
        });
        assert.ok([200, 503].includes(forgot.status));
      }

      const { response, cookie } = await app.login();
      assert.equal(response.status, 200);
      const auth = { ...json, Cookie: cookie };

      await mongoose.connect(app.mongoUri);
      const request = await LearnerRequest.create({
        referenceCode: "GSNM-20261021-AAAAAAAA",
        fullName: "Nguyễn An Bình",
        goal: "ielts",
        currentLevel: "basic",
        format: "online",
        availability: "Tối",
        availabilitySlots: ["weekday_evening"],
        consentAt: new Date(),
      });
      const tutor = await TutorApplication.create({
        referenceCode: "GSNM-GS-20261021-BBBBBBBB",
        fullName: "Trần Minh Thư",
        preferredChannel: "zalo",
        phone: "0901234567",
        teachingAreas: ["ielts"],
        learnerLevels: ["basic"],
        experience: "one_to_two",
        experienceNote: "Hai năm dạy IELTS.",
        format: "online",
        availabilitySlots: ["weekday_evening"],
        consentAt: new Date(),
      });
      const requestId = String(request._id);
      const tutorId = String(tutor._id);

      // Dashboard shows the request as not yet contacted.
      const dashboard = await (
        await fetch(`${app.base}/admin`, { headers: { Cookie: cookie } })
      ).text();
      assert.ok(dashboard.includes("GSNM-20261021-AAAAAAAA"));
      assert.ok(dashboard.includes("Thanh Trà"));

      // Invalid and stale writes are refused with clear errors.
      const invalid = await fetch(
        `${app.base}/api/admin/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: auth,
          body: JSON.stringify({ from: "NEW", to: "BOGUS" }),
        },
      );
      assert.equal(invalid.status, 400);
      const wrongOrigin = await fetch(
        `${app.base}/api/admin/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: { ...auth, Origin: "https://evil.example" },
          body: JSON.stringify({ from: "NEW", to: "CONTACTED", note: "" }),
        },
      );
      assert.equal(wrongOrigin.status, 403);

      const contacted = await fetch(
        `${app.base}/api/admin/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: auth,
          body: JSON.stringify({
            from: "NEW",
            to: "CONTACTED",
            note: "Gọi qua Zalo",
          }),
        },
      );
      assert.equal(contacted.status, 200);
      const again = await fetch(
        `${app.base}/api/admin/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: auth,
          body: JSON.stringify({ from: "NEW", to: "CONTACTED", note: "" }),
        },
      );
      assert.equal(again.status, 409);

      const saved = await LearnerRequest.findById(requestId).lean();
      assert.equal(saved?.status, "CONTACTED");
      assert.equal(saved?.statusHistory[0]?.by, "Thanh Trà");
      assert.ok(saved?.contactedAt);

      // Tutor: review, approve, then connect.
      const patch = (path: string, body: unknown) =>
        fetch(`${app.base}${path}`, {
          method: "PATCH",
          headers: auth,
          body: JSON.stringify(body),
        });
      assert.equal(
        (
          await patch(`/api/admin/tutors/${tutorId}/status`, {
            from: "NEW",
            to: "REVIEWING",
          })
        ).status,
        200,
      );
      for (const check of ["identity", "certificates", "experience"]) {
        assert.equal(
          (
            await patch(`/api/admin/tutors/${tutorId}/review`, {
              check,
              reviewed: true,
              note: "Đã đối chiếu",
            })
          ).status,
          200,
        );
      }
      assert.equal(
        (
          await patch(`/api/admin/tutors/${tutorId}/status`, {
            from: "REVIEWING",
            to: "ELIGIBLE",
          })
        ).status,
        200,
      );

      const match = await fetch(
        `${app.base}/admin/requests/${requestId}/match`,
        { headers: { Cookie: cookie } },
      );
      assert.equal(match.status, 200);
      assert.ok((await match.text()).includes("Trần Minh Thư"));

      const body = JSON.stringify({ requestId, tutorId, note: "" });
      const [one, two] = await Promise.all([
        fetch(`${app.base}/api/admin/connections`, {
          method: "POST",
          headers: auth,
          body,
        }),
        fetch(`${app.base}/api/admin/connections`, {
          method: "POST",
          headers: auth,
          body,
        }),
      ]);
      assert.deepEqual([one.status, two.status].sort(), [201, 409]);
    } finally {
      await mongoose.disconnect();
      await app.stop();
    }
  },
);

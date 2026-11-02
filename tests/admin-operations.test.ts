import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { createAdminActor } from "../src/features/admin-auth/server/actor.ts";
import { verifyPassword } from "../src/features/admin-auth/server/password.ts";
import { AdminUser } from "../src/features/admin-auth/server/user-model.ts";
import { Connection } from "../src/features/admin/server/connection-model.ts";
import {
  assignRequest,
  confirmParty,
  recordPayment,
  getOperationMetrics,
  setAvailability,
} from "../src/features/admin/server/operations.ts";
import {
  changeConnectionStatus,
  createConnection,
} from "../src/features/admin/server/service.ts";
import { LearnerRequest } from "../src/features/learner-requests/server/model.ts";
import { TutorApplication } from "../src/features/tutor-applications/server/model.ts";

test("confirmations, assignments and receipts enforce business rules and reject stale/duplicate writes", async () => {
  const mongo = await MongoMemoryServer.create();
  const beforeUri = process.env.MONGODB_URI,
    beforeAllowed = process.env.ADMIN_ALLOWED_EMAILS;
  process.env.MONGODB_URI = mongo.getUri("operations_test");
  process.env.ADMIN_ALLOWED_EMAILS = "operator@example.com";
  const who = createAdminActor("Vận hành");
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await AdminUser.create({
      email: "operator@example.com",
      name: "Vận hành",
      passwordHash: "provisioned",
    });
    const bootstrapPassword = "temporary isolated account password";
    const bootstrap = spawnSync(
      process.execPath,
      ["--conditions=react-server", "scripts/create-admin.mjs"],
      {
        encoding: "utf8",
        timeout: 15000,
        env: {
          ...process.env,
          ADMIN_ALLOWED_EMAILS: "script@example.com",
          ADMIN_BOOTSTRAP_EMAIL: "script@example.com",
          ADMIN_BOOTSTRAP_NAME: "Script Test",
          ADMIN_BOOTSTRAP_PASSWORD: bootstrapPassword,
        },
      },
    );
    assert.equal(bootstrap.status, 0, bootstrap.stderr);
    assert.ok(!bootstrap.stdout.includes(bootstrapPassword));
    const provisioned = await AdminUser.findOne({
      email: "script@example.com",
    }).lean();
    assert.ok(
      provisioned?.passwordHash &&
        (await verifyPassword(bootstrapPassword, provisioned.passwordHash)),
    );
    const resetPassword = "new isolated account password";
    const scriptEnv = {
      ...process.env,
      ADMIN_ALLOWED_EMAILS: "script@example.com",
      ADMIN_BOOTSTRAP_EMAIL: "script@example.com",
      ADMIN_BOOTSTRAP_NAME: "Script Test",
      ADMIN_BOOTSTRAP_PASSWORD: resetPassword,
    };
    const refused = spawnSync(
      process.execPath,
      ["--conditions=react-server", "scripts/create-admin.mjs"],
      { encoding: "utf8", timeout: 15000, env: scriptEnv },
    );
    assert.equal(refused.status, 1);
    assert.ok(refused.stderr.includes("CHƯA THAY ĐỔI MẬT KHẨU"));
    assert.equal(
      (await AdminUser.findOne({ email: "script@example.com" }).lean())
        ?.passwordHash,
      provisioned?.passwordHash,
    );
    const reset = spawnSync(
      process.execPath,
      ["--conditions=react-server", "scripts/create-admin.mjs", "--reset"],
      { encoding: "utf8", timeout: 15000, env: scriptEnv },
    );
    assert.equal(reset.status, 0, reset.stderr);
    assert.ok(!reset.stdout.includes(resetPassword));
    const resetAccount = await AdminUser.findOne({
      email: "script@example.com",
    }).lean();
    assert.ok(
      resetAccount?.passwordHash &&
        (await verifyPassword(resetPassword, resetAccount.passwordHash)),
    );
    const tutor = await TutorApplication.create({
      referenceCode: "T-1",
      fullName: "Gia sư",
      phone: "0901234567",
      preferredChannel: "zalo",
      teachingAreas: ["ielts"],
      learnerLevels: ["basic"],
      experience: "one_to_two",
      experienceNote: "Dạy IELTS",
      format: "online",
      availabilitySlots: ["weekday_evening"],
      consentAt: new Date(),
      status: "ELIGIBLE",
      acceptingStudents: true,
    });
    const request = await LearnerRequest.create({
      referenceCode: "R-1",
      fullName: "Người học",
      goal: "ielts",
      currentLevel: "basic",
      format: "online",
      availability: "Tối",
      consentAt: new Date(),
      status: "CONTACTED",
    });
    const requestId = String(request._id),
      tutorId = String(tutor._id);
    assert.equal(
      (
        await assignRequest(
          requestId,
          { email: "outsider@example.com", expected: "" },
          who,
        )
      ).ok,
      false,
    );
    assert.equal(
      (
        await assignRequest(
          requestId,
          { email: "operator@example.com", expected: "" },
          who,
        )
      ).ok,
      true,
    );
    assert.equal(
      (await assignRequest(requestId, { email: "", expected: "" }, who)).ok,
      false,
    );
    const created = await createConnection(
      { requestId, tutorId, note: "Đã đối chiếu mục tiêu" },
      who,
    );
    assert.ok(created.ok);
    const id = created.data.id;
    assert.ok(
      (
        await changeConnectionStatus(
          id,
          { from: "REVIEWING", to: "INTRODUCED", note: "" },
          who,
        )
      ).ok,
    );
    const payment = {
      action: "receive",
      revision: 0,
      method: "transfer",
      reference: "TX-001",
      paidOn: new Date().toISOString(),
      note: "Đã đối soát ngân hàng",
    } as const;
    assert.equal((await recordPayment(id, payment, who)).ok, false);
    assert.equal(
      (
        await changeConnectionStatus(
          id,
          { from: "INTRODUCED", to: "STARTED", note: "" },
          who,
        )
      ).ok,
      false,
    );
    assert.ok(
      (
        await confirmParty(
          id,
          { side: "learner", revision: 1, note: "Đồng ý qua điện thoại" },
          who,
        )
      ).ok,
    );
    assert.equal(
      (await Connection.findById(id).lean())?.paymentStatus,
      "NOT_DUE",
    );
    assert.equal(
      (
        await confirmParty(
          id,
          { side: "tutor", revision: 0, note: "Đồng ý qua Zalo" },
          who,
        )
      ).ok,
      false,
    );
    assert.ok(
      (
        await confirmParty(
          id,
          { side: "tutor", revision: 2, note: "Đồng ý qua Zalo" },
          who,
        )
      ).ok,
    );
    assert.equal((await Connection.findById(id).lean())?.status, "CONFIRMED");
    let metrics = await getOperationMetrics(who);
    assert.equal(metrics.revenue, 0);
    assert.equal(metrics.outstanding, 1);
    const receipt = {
      ...payment,
      revision: 3,
      paidOn: new Date().toISOString(),
    };
    const writes = await Promise.all([
      recordPayment(id, receipt, who),
      recordPayment(id, receipt, who),
    ]);
    assert.equal(writes.filter((x) => x.ok).length, 1);
    metrics = await getOperationMetrics(who);
    assert.equal(metrics.revenue, 50000);
    assert.equal(metrics.paid, 1);
    assert.equal(metrics.outstanding, 0);
    assert.equal(
      (
        await changeConnectionStatus(
          id,
          { from: "CONFIRMED", to: "DECLINED", note: "Đổi ý sau khi thu phí" },
          who,
        )
      ).ok,
      false,
    );
    assert.ok(
      (
        await recordPayment(
          id,
          {
            ...receipt,
            action: "reverse",
            revision: 4,
            note: "Đã đối soát lại, ghi nhận nhầm",
          },
          who,
        )
      ).ok,
    );
    assert.equal((await getOperationMetrics(who)).revenue, 0);
    assert.equal(
      (await Connection.findById(id).lean())?.operationsHistory.length,
      4,
    );
    assert.ok(
      (
        await setAvailability(
          tutorId,
          { accepting: false, expected: true },
          who,
        )
      ).ok,
    );
    assert.equal((await getOperationMetrics(who)).availableTutors, 0);
    const another = await LearnerRequest.create({
      referenceCode: "R-2",
      fullName: "Người học khác",
      goal: "ielts",
      currentLevel: "basic",
      format: "online",
      availability: "Tối",
      consentAt: new Date(),
      status: "CONTACTED",
    });
    assert.equal(
      (
        await createConnection(
          { requestId: String(another._id), tutorId, note: "" },
          who,
        )
      ).ok,
      false,
    );
    await assert.rejects(
      () => getOperationMetrics({ operator: "forged" } as never),
      /Admin access/,
    );
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    if (beforeUri) process.env.MONGODB_URI = beforeUri;
    else delete process.env.MONGODB_URI;
    if (beforeAllowed) process.env.ADMIN_ALLOWED_EMAILS = beforeAllowed;
    else delete process.env.ADMIN_ALLOWED_EMAILS;
  }
});

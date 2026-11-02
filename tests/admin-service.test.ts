import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";

import { createAdminActor } from "../src/features/admin-auth/server/actor.ts";
import { Connection } from "../src/features/admin/server/connection-model.ts";
import {
  findTutorCandidates,
  getDashboard,
  listConnections,
  listRequests,
  listTutors,
} from "../src/features/admin/server/queries.ts";
import {
  changeConnectionStatus,
  changeLearnerStatus,
  changeTutorStatus,
  createConnection,
  setTutorReview,
} from "../src/features/admin/server/service.ts";
import { parseRequestListParams } from "../src/features/admin/validation.ts";
import { LearnerRequest } from "../src/features/learner-requests/server/model.ts";
import { TutorApplication } from "../src/features/tutor-applications/server/model.ts";

const OPERATOR = "Thanh Trà";
const WHO = createAdminActor(OPERATOR);
let seq = 0;

function learner(overrides: Record<string, unknown> = {}) {
  seq += 1;
  return {
    referenceCode: `GSNM-T-${seq}`,
    fullName: `Người học ${seq}`,
    email: "hoc@example.com",
    goal: "ielts",
    currentLevel: "intermediate",
    format: "online",
    budgetMax: 200000,
    availabilitySlots: ["weekday_evening"],
    availability: "Tối trong tuần",
    consentAt: new Date(),
    ...overrides,
  };
}

function tutor(overrides: Record<string, unknown> = {}) {
  seq += 1;
  return {
    referenceCode: `GSNM-GS-T-${seq}`,
    fullName: `Gia sư ${seq}`,
    phone: "0901234567",
    preferredChannel: "zalo",
    acceptingStudents: true,
    teachingAreas: ["ielts"],
    learnerLevels: ["intermediate"],
    experience: "one_to_two",
    experienceNote: "Hai năm dạy IELTS cho sinh viên.",
    format: "either",
    availabilitySlots: ["weekday_evening"],
    expectedFee: 150000,
    consentAt: new Date(),
    ...overrides,
  };
}

async function withDatabase(run: () => Promise<void>) {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("gsnm_admin_service");
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    await run();
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    delete process.env.MONGODB_URI;
  }
}

async function approveTutor(id: string) {
  assert.ok(
    (
      await changeTutorStatus(
        id,
        { from: "NEW", to: "REVIEWING", note: "" },
        WHO,
      )
    ).ok,
  );
  for (const check of ["identity", "certificates", "experience"] as const) {
    const done = await setTutorReview(
      id,
      { check, reviewed: true, note: "Đã đối chiếu bản gốc" },
      WHO,
    );
    assert.ok(done.ok);
  }
  assert.ok(
    (
      await changeTutorStatus(
        id,
        { from: "REVIEWING", to: "ELIGIBLE", note: "" },
        WHO,
      )
    ).ok,
  );
}

test("learner status changes are recorded, ordered and conflict-safe", async () => {
  await withDatabase(async () => {
    const doc = await LearnerRequest.create(learner());
    const id = String(doc._id);

    const skipped = await changeLearnerStatus(
      id,
      { from: "NEW", to: "STARTED", note: "" },
      WHO,
    );
    assert.deepEqual([skipped.ok, !skipped.ok && skipped.status], [false, 422]);

    const stale = await changeLearnerStatus(
      id,
      { from: "SEARCHING", to: "INTRODUCED", note: "" },
      WHO,
    );
    assert.deepEqual([stale.ok, !stale.ok && stale.status], [false, 409]);

    // Receiving the form is not a contact.
    assert.equal((await LearnerRequest.findById(id).lean())?.contactedAt, null);

    // A double click sends the same change twice: only one is applied.
    const [first, second] = await Promise.all([
      changeLearnerStatus(
        id,
        { from: "NEW", to: "CONTACTED", note: "Gọi qua Zalo" },
        WHO,
      ),
      changeLearnerStatus(
        id,
        { from: "NEW", to: "CONTACTED", note: "Gọi qua Zalo" },
        WHO,
      ),
    ]);
    assert.equal([first, second].filter((result) => result.ok).length, 1);

    const saved = await LearnerRequest.findById(id).lean();
    assert.equal(saved?.status, "CONTACTED");
    assert.ok(saved?.contactedAt);
    assert.equal(saved?.statusHistory.length, 1);
    assert.equal(saved?.statusHistory[0]?.by, OPERATOR);

    const noReason = await changeLearnerStatus(
      id,
      { from: "CONTACTED", to: "CLOSED", note: "" },
      WHO,
    );
    assert.deepEqual(
      [noReason.ok, !noReason.ok && noReason.status],
      [false, 422],
    );
    assert.ok(
      (
        await changeLearnerStatus(
          id,
          { from: "CONTACTED", to: "CLOSED", note: "Đã tìm được nơi khác" },
          WHO,
        )
      ).ok,
    );
    const closed = await changeLearnerStatus(
      id,
      { from: "CLOSED", to: "SEARCHING", note: "" },
      WHO,
    );
    assert.equal(closed.ok, false);
  });
});

test("records saved before the workflow (status NEW only) can be processed", async () => {
  await withDatabase(async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
    const raw = learner();
    const inserted = await LearnerRequest.collection.insertOne({
      ...raw,
      status: "NEW",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const id = String(inserted.insertedId);
    const result = await changeLearnerStatus(
      id,
      { from: "NEW", to: "CONTACTED", note: "" },
      WHO,
    );
    assert.ok(result.ok);
    assert.equal(
      (await LearnerRequest.findById(id).lean())?.statusHistory.length,
      1,
    );
  });
});

test("a tutor cannot be eligible until each check is recorded", async () => {
  await withDatabase(async () => {
    const doc = await TutorApplication.create(tutor());
    const id = String(doc._id);

    // The submitted form is not a verification.
    const early = await changeTutorStatus(
      id,
      { from: "NEW", to: "ELIGIBLE", note: "" },
      WHO,
    );
    assert.equal(early.ok, false);

    assert.ok(
      (
        await changeTutorStatus(
          id,
          { from: "NEW", to: "REVIEWING", note: "" },
          WHO,
        )
      ).ok,
    );
    const noEvidence = await setTutorReview(
      id,
      { check: "identity", reviewed: true, note: "" },
      WHO,
    );
    assert.equal(noEvidence.ok, false);
    const future = await setTutorReview(
      id,
      {
        check: "identity",
        reviewed: true,
        note: "ok ok",
        reviewedOn: "2999-01-01",
      },
      WHO,
    );
    assert.equal(future.ok, false);

    assert.ok(
      (
        await setTutorReview(
          id,
          { check: "identity", reviewed: true, note: "CCCD bản gốc" },
          WHO,
        )
      ).ok,
    );
    const partial = await changeTutorStatus(
      id,
      { from: "REVIEWING", to: "ELIGIBLE", note: "" },
      WHO,
    );
    assert.deepEqual([partial.ok, !partial.ok && partial.status], [false, 422]);

    await setTutorReview(
      id,
      { check: "certificates", reviewed: true, note: "IELTS 7.5 đã xác thực" },
      WHO,
    );
    await setTutorReview(
      id,
      { check: "experience", reviewed: true, note: "Gọi người giới thiệu" },
      WHO,
    );
    assert.ok(
      (
        await changeTutorStatus(
          id,
          { from: "REVIEWING", to: "ELIGIBLE", note: "" },
          WHO,
        )
      ).ok,
    );

    // Evidence cannot be edited behind the back of an eligible profile.
    const locked = await setTutorReview(
      id,
      { check: "identity", reviewed: false, note: "" },
      WHO,
    );
    assert.equal(locked.ok, false);

    const saved = await TutorApplication.findById(id).lean();
    assert.equal(saved?.reviews?.identity?.reviewed, true);
    assert.equal(saved?.reviews?.identity?.reviewedBy, OPERATOR);
    assert.ok(saved?.reviews?.identity?.reviewedAt);
  });
});

test("connections: gated, never duplicated and tracked step by step", async () => {
  await withDatabase(async () => {
    const request = await LearnerRequest.create(learner());
    const requestId = String(request._id);
    const profile = await TutorApplication.create(tutor());
    const tutorId = String(profile._id);

    const tooEarly = await createConnection(
      { requestId, tutorId, note: "" },
      WHO,
    );
    assert.deepEqual(
      [tooEarly.ok, !tooEarly.ok && tooEarly.status],
      [false, 422],
    );

    await changeLearnerStatus(
      requestId,
      { from: "NEW", to: "CONTACTED", note: "" },
      WHO,
    );
    const notEligible = await createConnection(
      { requestId, tutorId, note: "" },
      WHO,
    );
    assert.deepEqual(
      [notEligible.ok, !notEligible.ok && notEligible.status],
      [false, 422],
    );

    await approveTutor(tutorId);

    // Two admins (or a double click) create the same pair at once.
    const results = await Promise.all([
      createConnection({ requestId, tutorId, note: "" }, WHO),
      createConnection(
        { requestId, tutorId, note: "" },
        createAdminActor("Hoàng Anh"),
      ),
    ]);
    assert.equal(results.filter((result) => result.ok).length, 1);
    assert.ok(results.some((result) => !result.ok && result.status === 409));
    assert.equal(await Connection.countDocuments({}), 1);

    const connection = await Connection.findOne({}).lean();
    const id = String(connection?._id);
    assert.equal(connection?.status, "REVIEWING");

    const skipped = await changeConnectionStatus(
      id,
      { from: "REVIEWING", to: "STARTED", note: "" },
      WHO,
    );
    assert.equal(skipped.ok, false);
    assert.ok(
      (
        await changeConnectionStatus(
          id,
          { from: "REVIEWING", to: "INTRODUCED", note: "" },
          WHO,
        )
      ).ok,
    );
    assert.ok((await Connection.findById(id).lean())?.introducedAt);

    // Creating and changing a connection never touches the request status.
    assert.equal(
      (await LearnerRequest.findById(requestId).lean())?.status,
      "CONTACTED",
    );

    const noReason = await changeConnectionStatus(
      id,
      { from: "INTRODUCED", to: "DECLINED", note: "" },
      WHO,
    );
    assert.equal(noReason.ok, false);
    assert.ok(
      (
        await changeConnectionStatus(
          id,
          { from: "INTRODUCED", to: "DECLINED", note: "Người học đổi ý" },
          WHO,
        )
      ).ok,
    );
    assert.equal((await Connection.findById(id).lean())?.history.length, 3);

    // A tutor who stops being eligible cannot be introduced again.
    await changeTutorStatus(
      tutorId,
      { from: "ELIGIBLE", to: "INELIGIBLE", note: "Không xác thực được" },
      WHO,
    );
    const blocked = await changeConnectionStatus(
      id,
      { from: "DECLINED", to: "REVIEWING", note: "" },
      WHO,
    );
    assert.equal(blocked.ok, false);
  });
});

test("lists are paged from the database and searchable", async () => {
  await withDatabase(async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
    await LearnerRequest.insertMany(
      [...Array(45).keys()].map((index) =>
        learner({
          fullName: index === 7 ? "Lê Thị Đặc Biệt" : `Người học ${index}`,
          createdAt: new Date(Date.now() - index * 60_000),
        }),
      ),
    );
    const params = (page: number, extra: Record<string, string> = {}) =>
      parseRequestListParams({ page: String(page), ...extra });

    const first = await listRequests(WHO, params(1));
    assert.equal(first.total, 45);
    assert.equal(first.items.length, 25);
    assert.equal(first.pages, 2);
    assert.equal((await listRequests(WHO, params(2))).items.length, 20);
    // A page past the end falls back to the last real page.
    assert.equal((await listRequests(WHO, params(99))).page, 2);
    const wide = await listRequests(WHO, params(1, { size: "50" }));
    assert.deepEqual([wide.items.length, wide.pages], [45, 1]);

    const found = await listRequests(WHO, params(1, { q: "đặc biệt" }));
    assert.equal(found.total, 1);
    assert.equal(
      (await listRequests(WHO, params(1, { q: "GSNM-T-" }))).total,
      45,
    );
    assert.equal((await listRequests(WHO, params(1, { q: ".*" }))).total, 0);
    assert.equal(
      (await listRequests(WHO, params(1, { status: "CONTACTED" }))).total,
      0,
    );
    assert.equal(
      (
        await listTutors(WHO, {
          page: 1,
          size: 25,
          q: "",
          status: undefined,
          stage: undefined,
          accepting: undefined,
          area: undefined,
          format: undefined,
        })
      ).total,
      0,
    );
    assert.equal(
      (
        await listConnections(WHO, {
          page: 1,
          size: 25,
          q: "",
          status: undefined,
          payment: undefined,
          confirmed: false,
        })
      ).total,
      0,
    );
  });
});

test("the dashboard is computed from stored statuses and contact times", async () => {
  await withDatabase(async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
    const hours = (value: number) => new Date(Date.now() - value * 3_600_000);

    await LearnerRequest.collection.insertMany([
      // Old record from before the workflow: only NEW, no other fields.
      {
        ...learner(),
        status: "NEW",
        createdAt: hours(30),
        updatedAt: hours(30),
      },
      { ...learner(), status: "NEW", createdAt: hours(2), updatedAt: hours(2) },
      {
        ...learner(),
        status: "CONTACTED",
        createdAt: hours(50),
        updatedAt: hours(40),
        contactedAt: hours(49),
      },
      {
        ...learner(),
        status: "SEARCHING",
        createdAt: hours(80),
        updatedAt: hours(40),
        contactedAt: hours(30),
      },
    ]);
    await TutorApplication.create(tutor());

    const dashboard = await getDashboard(WHO);
    assert.equal(dashboard.learners.NEW, 2);
    assert.equal(dashboard.learners.CONTACTED, 1);
    assert.equal(dashboard.learners.SEARCHING, 1);
    assert.equal(dashboard.totals.learners, 4);
    assert.equal(dashboard.overdue, 1);
    assert.deepEqual(dashboard.contacted, { total: 2, onTime: 1 });
    assert.equal(dashboard.tutors.NEW, 1);
    // Oldest unattended request is listed first.
    assert.equal(dashboard.waiting.length, 2);
    assert.ok(
      new Date(dashboard.waiting[0]!.createdAt) <
        new Date(dashboard.waiting[1]!.createdAt),
    );
  });
});

test("candidate search returns only eligible tutors matching content and format", async () => {
  await withDatabase(async () => {
    const request = await LearnerRequest.create(
      learner({ goal: "ielts", format: "online" }),
    );
    const make = async (
      overrides: Record<string, unknown>,
      eligible = true,
    ) => {
      const doc = await TutorApplication.create(tutor(overrides));
      if (eligible)
        await TutorApplication.updateOne(
          { _id: doc._id },
          { status: "ELIGIBLE" },
        );
      return String(doc._id);
    };
    const good = await make({});
    await make({ teachingAreas: ["toeic"] });
    await make({ format: "in_person" });
    await make({}, false);

    const lean = request.toObject();
    const result = await findTutorCandidates(WHO, lean as never, {
      page: 1,
      soft: { level: false, slots: false, fee: false },
      showAll: false,
    });
    assert.deepEqual(
      result.items.map((item) => String(item._id)),
      [good],
    );
    assert.equal(result.eligibleTotal, 3);

    const wider = await findTutorCandidates(WHO, lean as never, {
      page: 1,
      soft: { level: false, slots: false, fee: false },
      showAll: true,
    });
    assert.equal(wider.total, 3);
  });
});

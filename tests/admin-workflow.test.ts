import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTutorFilter,
  compareTutor,
  passesHardCriteria,
} from "../src/features/admin/matching.ts";
import { missingReviews } from "../src/features/admin/server/service.ts";
import {
  PAGE_SIZE,
  createConnectionSchema,
  escapeRegex,
  learnerStatusChangeSchema,
  parseConnectionListParams,
  parseMatchParams,
  parseRequestListParams,
  parseTutorListParams,
  tutorReviewSchema,
} from "../src/features/admin/validation.ts";
import {
  RESPONSE_SLA_MS,
  canTransition,
  describeSla,
  formatDuration,
  learnerStatuses,
  connectionStatuses,
  normalizeStatus,
  responseSla,
  statusLabel,
  statusNeedsNote,
  statusOptions,
  suggestRequestStatus,
  transitions,
  tutorStatuses,
} from "../src/shared/lib/workflow.ts";

/* ---------------------------- status flow ---------------------------- */

test("learner requests follow the agreed flow and cannot skip steps", () => {
  assert.ok(canTransition("learner", "NEW", "CONTACTED"));
  assert.ok(canTransition("learner", "CONTACTED", "SEARCHING"));
  assert.ok(canTransition("learner", "SEARCHING", "INTRODUCED"));
  assert.ok(canTransition("learner", "INTRODUCED", "STARTED"));
  assert.ok(!canTransition("learner", "NEW", "INTRODUCED"));
  assert.ok(!canTransition("learner", "NEW", "STARTED"));
  assert.ok(!canTransition("learner", "CONTACTED", "STARTED"));
  assert.ok(!canTransition("learner", "NEW", "NEW"));
  assert.deepEqual(transitions.learner.CLOSED, []);
});

test("every status can reach a final state and none points outside the set", () => {
  for (const [kind, statuses] of [
    ["learner", learnerStatuses],
    ["tutor", tutorStatuses],
    ["connection", connectionStatuses],
  ] as const) {
    for (const from of statuses) {
      for (const to of transitions[kind][from as never] as readonly string[]) {
        assert.ok(
          (statuses as readonly string[]).includes(to),
          `${kind}:${from}->${to}`,
        );
      }
    }
  }
});

test("a tutor must be reviewed before being eligible; ineligible needs a reason", () => {
  assert.ok(!canTransition("tutor", "NEW", "ELIGIBLE"));
  assert.ok(canTransition("tutor", "NEW", "REVIEWING"));
  assert.ok(canTransition("tutor", "REVIEWING", "ELIGIBLE"));
  assert.ok(statusNeedsNote("tutor", "INELIGIBLE"));
  assert.ok(statusNeedsNote("learner", "CLOSED"));
  assert.ok(statusNeedsNote("connection", "DECLINED"));
  assert.ok(!statusNeedsNote("learner", "CONTACTED"));
});

test("records that only carry NEW (or nothing) stay valid", () => {
  assert.equal(normalizeStatus("learner", "NEW"), "NEW");
  assert.equal(normalizeStatus("learner", undefined), "NEW");
  assert.equal(normalizeStatus("learner", "garbage"), "NEW");
  assert.equal(normalizeStatus("tutor", undefined), "NEW");
  assert.equal(statusLabel("learner", undefined), "Mới nhận");
  assert.deepEqual(
    statusOptions("learner", "NEW").map((option) => option.value),
    ["CONTACTED", "CLOSED"],
  );
});

test("connections only suggest a request status, never decide it", () => {
  assert.equal(suggestRequestStatus("NEW", ["INTRODUCED"]), null);
  assert.equal(suggestRequestStatus("SEARCHING", ["REVIEWING"]), null);
  assert.equal(
    suggestRequestStatus("SEARCHING", ["INTRODUCED"])?.to,
    "INTRODUCED",
  );
  assert.equal(suggestRequestStatus("INTRODUCED", ["STARTED"])?.to, "STARTED");
  assert.equal(
    suggestRequestStatus("INTRODUCED", ["DECLINED", "DECLINED"])?.to,
    "SEARCHING",
  );
  assert.equal(suggestRequestStatus("INTRODUCED", []), null);
});

/* ------------------------------- 24h SLA ------------------------------- */

test("the 24-hour clock runs until the team records a contact", () => {
  const created = new Date("2026-10-20T01:00:00Z");
  const at = (hours: number) => new Date(created.getTime() + hours * 3_600_000);

  const waiting = responseSla({
    status: "NEW",
    createdAt: created,
    now: at(5),
  });
  assert.equal(waiting.kind, "waiting");
  assert.equal(waiting.kind === "waiting" && waiting.ms, 19 * 3_600_000);
  assert.equal(describeSla(waiting), "Còn 19 giờ");

  const overdue = responseSla({
    status: "NEW",
    createdAt: created,
    now: at(27),
  });
  assert.equal(overdue.kind, "overdue");
  assert.equal(describeSla(overdue), "Quá hạn 3 giờ");
});

test("receiving the form is not a contact; only contactedAt stops the clock", () => {
  const created = new Date("2026-10-20T01:00:00Z");
  const now = new Date(created.getTime() + 2 * 3_600_000);
  // Same record before and after the team marks it as contacted.
  assert.equal(
    responseSla({ status: "NEW", createdAt: created, now }).kind,
    "waiting",
  );
  const met = responseSla({
    status: "CONTACTED",
    createdAt: created,
    contactedAt: new Date(created.getTime() + 3_600_000),
    now,
  });
  assert.equal(met.kind, "met");
  const late = responseSla({
    status: "CONTACTED",
    createdAt: created,
    contactedAt: new Date(created.getTime() + RESPONSE_SLA_MS + 60_000),
    now,
  });
  assert.equal(late.kind, "late");
  assert.equal(
    responseSla({ status: "CLOSED", createdAt: created, now }).kind,
    "none",
  );
});

test("durations read naturally in Vietnamese", () => {
  assert.equal(formatDuration(5 * 60_000), "5 phút");
  assert.equal(formatDuration(65 * 60_000), "1 giờ 5 phút");
  assert.equal(formatDuration(3 * 3_600_000), "3 giờ");
  assert.equal(formatDuration(26 * 3_600_000), "1 ngày 2 giờ");
});

/* ------------------------------- matching ------------------------------- */

const request = {
  goal: "ielts",
  currentLevel: "intermediate",
  format: "online",
  budgetMax: 200_000,
  availabilitySlots: ["weekday_evening", "weekend_morning"],
};

test("hard filters cover teaching content and format only by default", () => {
  assert.deepEqual(buildTutorFilter(request), {
    teachingAreas: { $in: ["ielts"] },
    format: { $in: ["online", "either"] },
  });
  assert.deepEqual(
    buildTutorFilter({ ...request, goal: "unsure", format: "either" }),
    {},
  );
});

test("optional filters add level, schedule and fee conditions", () => {
  const filter = buildTutorFilter(request, {
    level: true,
    slots: true,
    fee: true,
  });
  assert.deepEqual(filter.$and, [
    { learnerLevels: "intermediate" },
    { availabilitySlots: { $in: request.availabilitySlots } },
    { $or: [{ expectedFee: null }, { expectedFee: { $lte: 200_000 } }] },
  ]);
  // Unknown values never exclude anybody.
  assert.equal(
    buildTutorFilter(
      {
        ...request,
        currentLevel: "unsure",
        budgetMax: null,
        availabilitySlots: [],
      },
      { level: true, slots: true, fee: true },
    ).$and,
    undefined,
  );
});

test("comparison reports match, mismatch and unknown without scoring", () => {
  const tutor = {
    teachingAreas: ["ielts"],
    learnerLevels: ["basic"],
    format: "either",
    availabilitySlots: ["weekday_evening"],
    expectedFee: 250_000,
  };
  const checks = compareTutor(request, tutor);
  const byKey = Object.fromEntries(
    checks.map((check) => [check.key, check.state]),
  );
  assert.deepEqual(byKey, {
    content: "match",
    format: "match",
    level: "mismatch",
    slots: "match",
    fee: "mismatch",
  });
  assert.ok(passesHardCriteria(checks));
  assert.ok(!("score" in checks[0]!));

  const wrong = compareTutor(request, {
    ...tutor,
    teachingAreas: ["toeic"],
    format: "in_person",
  });
  assert.ok(!passesHardCriteria(wrong));

  const open = compareTutor(
    { ...request, goal: "other", budgetMax: null, availabilitySlots: null },
    { ...tutor, expectedFee: null },
  );
  assert.equal(open.find((check) => check.key === "content")?.state, "unknown");
  assert.equal(open.find((check) => check.key === "slots")?.state, "unknown");
  assert.equal(open.find((check) => check.key === "fee")?.state, "unknown");
});

/* --------------------------- validation + paging --------------------------- */

test("list query strings are sanitised", () => {
  assert.deepEqual(parseRequestListParams({}), {
    page: 1,
    q: "",
    status: undefined,
    goal: undefined,
    format: undefined,
    overdue: false,
  });
  const parsed = parseRequestListParams({
    page: "-3",
    q: "  GSNM   2026  ",
    status: "NEW",
    goal: "not-a-goal",
    overdue: "1",
  });
  assert.equal(parsed.page, 1);
  assert.equal(parsed.q, "GSNM 2026");
  assert.equal(parsed.status, "NEW");
  assert.equal(parsed.goal, undefined);
  assert.equal(parsed.overdue, true);
  assert.equal(parseRequestListParams({ page: "abc" }).page, 1);
  assert.equal(parseRequestListParams({ page: "3" }).page, 3);
  assert.equal(parseRequestListParams({ q: "x".repeat(500) }).q.length, 60);
  assert.equal(
    parseTutorListParams({ status: "ELIGIBLE", area: "ielts" }).area,
    "ielts",
  );
  assert.equal(parseTutorListParams({ format: "mars" }).format, undefined);
  assert.equal(
    parseConnectionListParams({ status: "STARTED" }).status,
    "STARTED",
  );
  assert.equal(parseMatchParams({ level: "1", all: "1" }).soft.level, true);
  assert.equal(PAGE_SIZE, 20);
});

test("search text cannot inject regular expressions", () => {
  const pattern = new RegExp(escapeRegex("a.*(b"), "i");
  assert.ok(pattern.test("xxA.*(bxx"));
  assert.ok(!pattern.test("aaaab"));
});

test("admin write payloads are validated", () => {
  assert.ok(
    learnerStatusChangeSchema.safeParse({
      from: "NEW",
      to: "CONTACTED",
      note: " ok ",
    }).success,
  );
  assert.equal(
    learnerStatusChangeSchema.safeParse({ from: "NEW", to: "HACKED" }).success,
    false,
  );
  assert.equal(
    learnerStatusChangeSchema.safeParse({
      from: "NEW",
      to: "CLOSED",
      note: "x".repeat(2000),
    }).success,
    false,
  );
  assert.equal(
    createConnectionSchema.safeParse({ requestId: "nope", tutorId: "x" })
      .success,
    false,
  );
  assert.ok(
    createConnectionSchema.safeParse({
      requestId: "a".repeat(24),
      tutorId: "b".repeat(24),
    }).success,
  );
  assert.equal(
    tutorReviewSchema.safeParse({ check: "visa", reviewed: true }).success,
    false,
  );
  assert.equal(
    tutorReviewSchema.safeParse({
      check: "identity",
      reviewed: true,
      reviewedOn: "21/10/2026",
    }).success,
    false,
  );
});

test("a submitted tutor form is not a verified profile", () => {
  assert.deepEqual(missingReviews(undefined), [
    "identity",
    "certificates",
    "experience",
  ]);
  assert.deepEqual(
    missingReviews({
      identity: { reviewed: true },
      experience: { reviewed: true },
    }),
    ["certificates"],
  );
  assert.deepEqual(
    missingReviews({
      identity: { reviewed: true },
      certificates: { reviewed: true },
      experience: { reviewed: true },
    }),
    [],
  );
});

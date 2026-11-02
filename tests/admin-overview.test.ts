import assert from "node:assert/strict";
import test from "node:test";

import {
  demandAgainstTutors,
  matchingFunnel,
  parseRange,
  replyBuckets,
  replyRate,
  startOfVietnamDay,
  sumInside,
  windowsFor,
} from "../src/features/admin/overview.ts";

const HOUR = 3_600_000;
const now = new Date("2026-11-01T10:00:00+07:00");

test("range: only known values, 30 days by default", () => {
  assert.equal(parseRange("7d"), "7d");
  assert.equal(parseRange(["90d"]), "90d");
  assert.equal(parseRange("1y"), "30d");
  assert.equal(parseRange(undefined), "30d");
});

test("Vietnam day starts at midnight UTC+7", () => {
  assert.equal(
    new Date(startOfVietnamDay(now.getTime())).toISOString(),
    "2026-10-31T17:00:00.000Z",
  );
});

test("reply rate counts contacts recorded in the window", () => {
  const { current, previous } = windowsFor("7d", now);
  const created = new Date(now.getTime() - 3 * 24 * HOUR);
  const records = [
    { createdAt: created, contactedAt: new Date(created.getTime() + 2 * HOUR) },
    {
      createdAt: created,
      contactedAt: new Date(created.getTime() + 30 * HOUR),
    },
    { createdAt: created, contactedAt: null },
  ];
  assert.deepEqual(replyRate(records, current), {
    total: 2,
    onTime: 1,
    rate: 0.5,
  });
  assert.equal(replyRate(records, previous).rate, null);
});

test("revenue sums only payments inside the window", () => {
  const { current } = windowsFor("7d", now);
  assert.equal(
    sumInside(
      [
        { at: new Date(now.getTime() - HOUR), amount: 50000 },
        { at: new Date(now.getTime() - 10 * 24 * HOUR), amount: 50000 },
      ],
      current,
    ),
    50000,
  );
});

test("reply buckets: daily for 7 days, weekly for 90 days", () => {
  const today = new Date(now.getTime() - HOUR);
  const buckets = replyBuckets(
    [
      { createdAt: today, contactedAt: new Date(today.getTime() + HOUR) },
      { createdAt: today, contactedAt: null },
      {
        createdAt: new Date(today.getTime() - 2 * 24 * HOUR),
        contactedAt: new Date(today.getTime() + 2 * HOUR),
      },
    ],
    "7d",
    now,
  );
  assert.equal(buckets.length, 7);
  assert.equal(buckets.at(-1)?.label, "01/11");
  assert.deepEqual(
    [buckets.at(-1)?.onTime, buckets.at(-1)?.notContacted],
    [1, 1],
  );
  assert.equal(buckets.at(-3)?.late, 1);
  assert.equal(replyBuckets([], "90d", now).length, 13);
});

test("funnel counts each request once per stage", () => {
  const stages = matchingFunnel(
    [
      { _id: "a", contactedAt: now },
      { _id: "b", contactedAt: now },
      { _id: "c", contactedAt: null },
    ],
    [
      {
        request: "a",
        introducedAt: now,
        confirmedAt: now,
        paymentStatus: "PAID",
      },
      { request: "a", introducedAt: now },
      { request: "b", introducedAt: now },
      { request: "other", introducedAt: now, confirmedAt: now },
    ],
  );
  assert.deepEqual(
    stages.map((stage) => stage.count),
    [3, 2, 2, 1, 1],
  );
});

test("demand compares open requests with tutors who teach the goal", () => {
  const rows = demandAgainstTutors(
    ["ielts", "ielts", "toeic", "unsure"],
    [["ielts"], ["toeic", "communication"], null],
  );
  const byGoal = Object.fromEntries(rows.map((row) => [row.goal, row]));
  assert.deepEqual([byGoal.ielts?.requests, byGoal.ielts?.tutors], [2, 1]);
  assert.deepEqual([byGoal.toeic?.requests, byGoal.toeic?.tutors], [1, 1]);
  assert.equal(byGoal.communication?.tutors, 1);
});

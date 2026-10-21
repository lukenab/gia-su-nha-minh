import assert from "node:assert/strict";
import test from "node:test";

import {
  describeAvailability,
  learnerRequestSchema,
} from "../lib/learner-request-validation.ts";

const valid = {
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
};

test("accepts a complete learner request", () => {
  assert.equal(learnerRequestSchema.safeParse(valid).success, true);
});

test("requires at least one contact method", () => {
  assert.equal(
    learnerRequestSchema.safeParse({ ...valid, email: "", phone: "" }).success,
    false,
  );
});

test("allows an undecided budget", () => {
  assert.equal(
    learnerRequestSchema.safeParse({ ...valid, budgetMax: null }).success,
    true,
  );
});

test("rejects missing consent and invalid goals", () => {
  assert.equal(
    learnerRequestSchema.safeParse({ ...valid, consent: false }).success,
    false,
  );
  assert.equal(
    learnerRequestSchema.safeParse({ ...valid, goal: "math" }).success,
    false,
  );
});

test("rejects honeypot submissions", () => {
  assert.equal(
    learnerRequestSchema.safeParse({ ...valid, website: "spam.example" })
      .success,
    false,
  );
});

test("accepts the new survey-based options", () => {
  assert.equal(
    learnerRequestSchema.safeParse({
      ...valid,
      goal: "unsure",
      format: "undecided",
      concerns: [],
    }).success,
    true,
  );
});

test("requires at least one availability slot", () => {
  assert.equal(
    learnerRequestSchema.safeParse({ ...valid, availabilitySlots: [] }).success,
    false,
  );
});

test("requires a phone number when the preferred channel is Zalo", () => {
  assert.equal(
    learnerRequestSchema.safeParse({ ...valid, preferredChannel: "zalo" })
      .success,
    false,
  );
  assert.equal(
    learnerRequestSchema.safeParse({
      ...valid,
      preferredChannel: "zalo",
      phone: "0901 234 567",
    }).success,
    true,
  );
});

test("summarises availability for the admin view", () => {
  assert.equal(
    describeAvailability(["weekday_evening", "weekend_morning"], "Sau 19:00"),
    "Tối trong tuần, Sáng cuối tuần. Sau 19:00",
  );
});

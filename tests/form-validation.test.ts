import assert from "node:assert/strict";
import test from "node:test";

import { initialState } from "../src/features/learner-requests/form-model.ts";
import {
  fieldOrder as learnerOrder,
  validate as validateLearner,
} from "../src/features/learner-requests/form-validation.ts";
import { initialState as tutorInitial } from "../src/features/tutor-applications/form-model.ts";
import { validate as validateTutor } from "../src/features/tutor-applications/form-validation.ts";

test("learner steps report the fields the visitor has to fill in", () => {
  const s = initialState();
  assert.deepEqual(Object.keys(validateLearner(0, s)).sort(), [
    "currentLevel",
    "goal",
  ]);
  assert.deepEqual(Object.keys(validateLearner(1, s)).sort(), [
    "availabilitySlots",
    "budgetChoice",
    "format",
    "startTime",
  ]);
  const contact = validateLearner(2, s);
  assert.ok(contact.fullName && contact.consent && contact.preferredChannel);
  assert.ok(learnerOrder.includes("consent"));
});

test("learner preselects only a known goal from the link", () => {
  assert.equal(initialState("ielts").goal, "ielts");
  assert.equal(initialState("hack").goal, "");
});

test("learner custom budget and contact channel rules", () => {
  const s = {
    ...initialState("ielts"),
    format: "online",
    availabilitySlots: ["weekday_evening"],
    startTime: "now",
    budgetChoice: "custom",
    budgetCustom: "5.000.000",
  };
  assert.ok(validateLearner(1, s).budgetCustom);
  assert.equal(
    validateLearner(1, { ...s, budgetCustom: "180000" }).budgetCustom,
    undefined,
  );
  const contact = {
    ...s,
    fullName: "Nguyễn An",
    preferredChannel: "zalo",
    consent: true,
  };
  assert.ok(validateLearner(2, contact).phone);
  assert.deepEqual(validateLearner(2, { ...contact, phone: "0901234567" }), {});
});

test("tutor steps check each part and the privacy consent", () => {
  const s = tutorInitial();
  assert.deepEqual(Object.keys(validateTutor(0, s)).sort(), [
    "education",
    "email",
    "fullName",
    "phone",
    "school",
  ]);
  const basics = {
    ...s,
    fullName: "Trần Bình",
    email: "a@b.vn",
    phone: "0901234567",
    education: "student",
    school: "Đại học Cần Thơ – Ngôn ngữ Anh",
    certificates: [{ type: "other", name: "", score: "" }],
  };
  assert.ok(validateTutor(0, basics)["certificates.0.name"]);
  assert.deepEqual(validateTutor(0, { ...basics, certificates: [] }), {});

  assert.ok(validateTutor(1, s).teachingAreas);
  // Photo and introduction are optional.
  assert.deepEqual(validateTutor(2, s), {});
  assert.ok(validateTutor(2, { ...s, bio: "x".repeat(1001) }).bio);
  assert.deepEqual(Object.keys(validateTutor(3, s)), ["consentPrivacy"]);
});

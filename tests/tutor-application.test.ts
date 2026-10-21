import assert from "node:assert/strict";
import test from "node:test";

import { tutorApplicationSchema } from "../lib/tutor-application-validation.ts";

const valid = {
  fullName: "Trần Minh Thư",
  email: "",
  phone: "0901234567",
  preferredChannel: "zalo",
  teachingAreas: ["communication", "vstep"],
  learnerLevels: ["beginner", "basic"],
  experience: "one_to_two",
  experienceNote: "Hai năm dạy giao tiếp cho sinh viên năm nhất.",
  certificates: "IELTS 7.5",
  format: "either",
  area: "Ninh Kiều",
  availabilitySlots: ["weekday_evening"],
  expectedFee: 180000,
  consent: true,
  website: "",
};

test("accepts a complete tutor application", () => {
  assert.equal(tutorApplicationSchema.safeParse(valid).success, true);
});

test("allows a negotiable fee", () => {
  assert.equal(
    tutorApplicationSchema.safeParse({ ...valid, expectedFee: null }).success,
    true,
  );
});

test("requires teaching areas and levels", () => {
  assert.equal(
    tutorApplicationSchema.safeParse({ ...valid, teachingAreas: [] }).success,
    false,
  );
  assert.equal(
    tutorApplicationSchema.safeParse({ ...valid, learnerLevels: [] }).success,
    false,
  );
});

test("rejects undecided format and missing consent", () => {
  assert.equal(
    tutorApplicationSchema.safeParse({ ...valid, format: "undecided" }).success,
    false,
  );
  assert.equal(
    tutorApplicationSchema.safeParse({ ...valid, consent: false }).success,
    false,
  );
});

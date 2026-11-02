import assert from "node:assert/strict";
import test from "node:test";

import {
  describeCertificates,
  tutorApplicationSchema,
} from "../src/features/tutor-applications/validation.ts";

/** A few bytes that start like a JPEG; enough for the format check. */
const photo = `data:image/jpeg;base64,${Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
]).toString("base64")}`;

export const validTutor = {
  fullName: "Trần Minh Thư",
  email: "thu@example.com",
  phone: "0901234567",
  phoneHasZalo: true,
  education: "student",
  school: "Trường Đại học Cần Thơ – Ngôn ngữ Anh",
  certificateList: [
    { type: "ielts", name: "", score: "7.5" },
    { type: "tesol", name: "", score: "" },
  ],
  teachingAreas: ["communication", "vstep"],
  otherTeachingArea: "",
  learnerLevels: ["beginner", "basic"],
  experience: "one_to_two",
  format: "either",
  area: "Ninh Kiều",
  availabilitySlots: ["weekday_evening"],
  expectedFee: 180000,
  bio: "Tôi có hai năm dạy tiếng Anh giao tiếp cho sinh viên năm nhất, tập trung vào phản xạ nói qua tình huống thực tế. Học viên của tôi thường tự tin thuyết trình bằng tiếng Anh sau ba tháng.",
  photo,
  consentPrivacy: true,
  website: "",
};

const parse = (overrides: Record<string, unknown> = {}) =>
  tutorApplicationSchema.safeParse({ ...validTutor, ...overrides }).success;

test("accepts a complete tutor application", () => {
  assert.equal(parse(), true);
  assert.equal(parse({ expectedFee: null, certificateList: [] }), true);
});

test("photo and introduction can be sent later", () => {
  const rest: Record<string, unknown> = { ...validTutor };
  delete rest.photo;
  delete rest.bio;
  assert.equal(tutorApplicationSchema.safeParse(rest).success, true);
  assert.equal(parse({ photo: "", bio: "" }), true);
  assert.equal(parse({ bio: "x".repeat(1001) }), false);
  assert.equal(
    parse({ photo: photo.replace("image/jpeg", "image/png") }),
    false,
  );
});

test("requires contact details, education and the privacy consent", () => {
  assert.equal(parse({ email: "" }), false);
  assert.equal(parse({ phone: "" }), false);
  assert.equal(parse({ school: "" }), false);
  assert.equal(parse({ education: "phd" }), false);
  assert.equal(parse({ consentPrivacy: false }), false);
});

test("checks teaching details", () => {
  assert.equal(parse({ teachingAreas: [] }), false);
  assert.equal(parse({ learnerLevels: [] }), false);
  assert.equal(parse({ format: "undecided" }), false);
  assert.equal(parse({ format: "in_person", area: "" }), false);
});

test("an other certificate needs its name; certificates read as one line", () => {
  assert.equal(
    parse({
      certificateList: [{ type: "other", name: "", score: "" }],
    }),
    false,
  );
  assert.equal(
    describeCertificates([
      { type: "ielts", score: "7.5", year: 2024 },
      { type: "other", name: "Chứng chỉ sư phạm", score: "", year: null },
    ]),
    "IELTS 7.5 (2024); Chứng chỉ sư phạm",
  );
});

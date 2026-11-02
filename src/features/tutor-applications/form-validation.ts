import type { Errors, State } from "./form-model.ts";

import { BIO_MAX } from "./limits.ts";

const phonePattern = /^\+?[0-9\s().-]{9,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(step: number, s: State): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (s.fullName.trim().length < 2) e.fullName = "Vui lòng nhập họ và tên.";
    if (!emailPattern.test(s.email.trim()))
      e.email = "Vui lòng nhập email hợp lệ, ví dụ ten@gmail.com.";
    if (!phonePattern.test(s.phone.trim()))
      e.phone = "Vui lòng nhập số điện thoại hợp lệ, ví dụ 0901 234 567.";
    if (!s.education) e.education = "Vui lòng chọn trình độ học vấn.";
    if (s.school.trim().length < 2)
      e.school = "Vui lòng nhập trường và chuyên ngành.";
    s.certificates.forEach((row, index) => {
      if (!row.type)
        e[`certificates.${index}.type`] = "Vui lòng chọn loại chứng chỉ.";
      if (row.type === "other" && row.name.trim().length < 2)
        e[`certificates.${index}.name`] = "Vui lòng nhập tên chứng chỉ.";
    });
  }
  if (step === 1) {
    if (!s.teachingAreas.length)
      e.teachingAreas = "Vui lòng chọn ít nhất một nội dung giảng dạy.";
    if (
      s.teachingAreas.includes("other") &&
      s.otherTeachingArea.trim().length < 5
    )
      e.otherTeachingArea = "Vui lòng mô tả nội dung khác (ít nhất 5 ký tự).";
    if (!s.learnerLevels.length)
      e.learnerLevels = "Vui lòng chọn ít nhất một trình độ học viên.";
    if (!s.experience) e.experience = "Vui lòng chọn thời gian giảng dạy.";
    if (!s.format) e.format = "Vui lòng chọn hình thức giảng dạy.";
    if (s.format && s.format !== "online" && s.area.trim().length < 2)
      e.area = "Vui lòng nhập khu vực có thể dạy trực tiếp.";
    if (!s.availabilitySlots.length)
      e.availabilitySlots = "Vui lòng chọn ít nhất một khung giờ.";
    if (!s.feeChoice) e.feeChoice = "Vui lòng chọn học phí dự kiến.";
    if (s.feeChoice === "custom") {
      const amount = Number(s.feeCustom.replace(/\D/g, ""));
      if (!amount || amount > 2_000_000)
        e.feeCustom = "Vui lòng nhập học phí từ 1 đến 2.000.000 đồng.";
    }
  }
  if (step === 2 && s.bio.trim().length > BIO_MAX)
    e.bio = `Phần giới thiệu tối đa ${BIO_MAX} ký tự.`;
  if (step === 3 && !s.consentPrivacy)
    e.consentPrivacy = "Vui lòng đồng ý với việc xử lý dữ liệu cá nhân.";
  return e;
}

/** Order used to focus the first invalid field on each step. */
export function fieldOrder(errors: Errors): string[] {
  const order = [
    "fullName",
    "email",
    "phone",
    "education",
    "school",
    "teachingAreas",
    "otherTeachingArea",
    "learnerLevels",
    "experience",
    "format",
    "area",
    "availabilitySlots",
    "feeChoice",
    "feeCustom",
    "bio",
    "consentPrivacy",
  ];
  const rows = Object.keys(errors)
    .filter((key) => key.startsWith("certificates."))
    .sort();
  const index = order.indexOf("school") + 1;
  return [...order.slice(0, index), ...rows, ...order.slice(index)].filter(
    (key) => errors[key],
  );
}

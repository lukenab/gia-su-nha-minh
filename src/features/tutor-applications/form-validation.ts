import type { Errors, State } from "./form-model.ts";

const phonePattern = /^\+?[0-9\s().-]{9,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(step: number, s: State): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!s.teachingAreas.length)
      e.teachingAreas = "Vui lòng chọn ít nhất một nội dung giảng dạy.";
    if (!s.learnerLevels.length)
      e.learnerLevels = "Vui lòng chọn ít nhất một trình độ.";
    if (!s.format) e.format = "Vui lòng chọn hình thức dạy.";
    if (!s.feeChoice) e.feeChoice = "Vui lòng chọn mức học phí mong muốn.";
    if (s.feeChoice === "custom") {
      const amount = Number(s.feeCustom.replace(/\D/g, ""));
      if (!amount || amount > 2_000_000)
        e.feeCustom = "Nhập học phí từ 1 đến 2.000.000 đồng.";
    }
  }
  if (step === 1) {
    if (!s.experience) e.experience = "Vui lòng chọn số năm kinh nghiệm.";
    if (s.experienceNote.trim().length < 10)
      e.experienceNote = "Vui lòng mô tả ngắn kinh nghiệm (ít nhất 10 ký tự).";
    if (!s.availabilitySlots.length)
      e.availabilitySlots = "Vui lòng chọn ít nhất một khung giờ.";
  }
  if (step === 2) {
    if (s.fullName.trim().length < 2) e.fullName = "Vui lòng nhập họ và tên.";
    if (!s.preferredChannel)
      e.preferredChannel = "Vui lòng chọn cách liên hệ bạn muốn.";
    const needsPhone = ["phone", "zalo"].includes(s.preferredChannel);
    if (s.phone && !phonePattern.test(s.phone.trim()))
      e.phone = "Số điện thoại chưa đúng định dạng.";
    else if (needsPhone && !s.phone.trim())
      e.phone = "Vui lòng nhập số điện thoại để liên hệ qua kênh đã chọn.";
    if (s.email && !emailPattern.test(s.email.trim()))
      e.email = "Email chưa đúng định dạng.";
    else if (s.preferredChannel === "email" && !s.email.trim())
      e.email = "Vui lòng nhập email để liên hệ qua email.";
    if (!s.phone.trim() && !s.email.trim() && !e.phone && !e.email)
      e.phone = "Vui lòng nhập số điện thoại hoặc email.";
    if (!s.consent) e.consent = "Vui lòng đồng ý để chúng tôi xử lý hồ sơ.";
  }
  return e;
}

export const fieldOrder: (keyof Errors)[] = [
  "teachingAreas",
  "learnerLevels",
  "format",
  "feeChoice",
  "feeCustom",
  "experience",
  "experienceNote",
  "availabilitySlots",
  "fullName",
  "preferredChannel",
  "phone",
  "email",
  "consent",
];

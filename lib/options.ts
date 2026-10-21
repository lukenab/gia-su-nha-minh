/*
 * Shared option lists for the learner and tutor forms, the API validation
 * and the admin pages. Values mirror the CP2 market survey (Chapter 2):
 * learner goals (Q3), levels (Q8), formats (Q12), start timing (Q2),
 * search difficulties (Q4) and tutor teaching areas (Q7).
 */

export const goalLabels = {
  foundation: "Tiếng Anh nền tảng",
  communication: "Giao tiếp tiếng Anh",
  work: "Phỏng vấn hoặc công việc",
  ielts: "Luyện thi IELTS",
  toeic: "Luyện thi TOEIC",
  unsure: "Chưa có mục tiêu cụ thể",
  other: "Mục tiêu khác",
} as const;

export const levelLabels = {
  beginner: "Mới bắt đầu / mất gốc",
  basic: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
  unsure: "Chưa xác định",
} as const;

export const formatLabels = {
  online: "Học trực tuyến",
  in_person: "Học trực tiếp tại Cần Thơ",
  either: "Cả hai hình thức",
  undecided: "Chưa xác định",
} as const;

export const startLabels = {
  asap: "Càng sớm càng tốt",
  within_month: "Trong 1 tháng tới",
  one_to_three_months: "Trong 1–3 tháng tới",
  not_sure: "Chưa chắc chắn",
} as const;

export const concernLabels = {
  fit_content: "Gia sư dạy đúng nội dung và trình độ",
  schedule: "Lịch học phù hợp",
  budget: "Học phí trong ngân sách",
  clear_profile: "Thông tin gia sư rõ ràng để so sánh",
} as const;

export const channelLabels = {
  phone: "Gọi điện thoại",
  zalo: "Zalo",
  email: "Email",
  messenger: "Facebook Messenger",
} as const;

export const slotLabels = {
  weekday_morning: "Sáng trong tuần",
  weekday_afternoon: "Chiều trong tuần",
  weekday_evening: "Tối trong tuần",
  weekend_morning: "Sáng cuối tuần",
  weekend_afternoon: "Chiều cuối tuần",
  weekend_evening: "Tối cuối tuần",
} as const;

export const teachingAreaLabels = {
  foundation: "Tiếng Anh nền tảng",
  communication: "Giao tiếp tiếng Anh",
  vstep: "Luyện thi VSTEP (B1/B2)",
  work: "Phỏng vấn hoặc công việc",
  ielts: "Luyện thi IELTS",
  toeic: "Luyện thi TOEIC",
  other: "Nội dung khác",
} as const;

export const tutorLevelLabels = {
  beginner: "Mới bắt đầu / mất gốc",
  basic: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
} as const;

export const experienceLabels = {
  under_1: "Dưới 1 năm",
  one_to_two: "1–2 năm",
  three_to_five: "3–5 năm",
  over_5: "Trên 5 năm",
} as const;

export function labelOf<T extends Record<string, string>>(
  labels: T,
  value: unknown,
): string {
  return typeof value === "string" && value in labels
    ? labels[value as keyof T]
    : String(value ?? "");
}

export function keysOf<T extends Record<string, string>>(labels: T) {
  return Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]];
}

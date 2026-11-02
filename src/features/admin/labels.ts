/*
 * English labels for the option values in src/shared/lib/options.ts. The
 * public forms keep the Vietnamese labels; the admin area shows these. Keys
 * are typed against the shared lists so a new option cannot be missed here.
 */
import type {
  certificateLabels as certificateLabelsVi,
  channelLabels as channelLabelsVi,
  concernLabels as concernLabelsVi,
  educationLabels as educationLabelsVi,
  experienceLabels as experienceLabelsVi,
  formatLabels as formatLabelsVi,
  goalLabels as goalLabelsVi,
  levelLabels as levelLabelsVi,
  slotLabels as slotLabelsVi,
  startLabels as startLabelsVi,
  teachingAreaLabels as teachingAreaLabelsVi,
  tutorLevelLabels as tutorLevelLabelsVi,
} from "../../shared/lib/options.ts";

type Same<T> = Record<keyof T, string>;

export const goalLabels: Same<typeof goalLabelsVi> = {
  foundation: "Foundation English",
  communication: "English conversation",
  work: "Interviews or work",
  ielts: "IELTS preparation",
  toeic: "TOEIC preparation",
  unsure: "No specific goal yet",
  other: "Other goal",
};

export const levelLabels: Same<typeof levelLabelsVi> = {
  beginner: "Beginner / starting over",
  basic: "Elementary",
  intermediate: "Intermediate",
  advanced: "Advanced",
  unsure: "Not sure",
};

export const formatLabels: Same<typeof formatLabelsVi> = {
  online: "Online",
  in_person: "In person in Can Tho",
  either: "Either format",
  undecided: "Not decided",
};

/** Tutors teach online, in person or both; they never pick "undecided". */
export const tutorFormatLabels = {
  online: formatLabels.online,
  in_person: formatLabels.in_person,
  either: formatLabels.either,
};

export const startLabels: Same<typeof startLabelsVi> = {
  asap: "As soon as possible",
  within_month: "Within the next month",
  one_to_three_months: "In 1–3 months",
  not_sure: "Not sure",
};

export const concernLabels: Same<typeof concernLabelsVi> = {
  fit_content: "Tutor teaches the right content and level",
  schedule: "A suitable schedule",
  budget: "Fees within budget",
  clear_profile: "Clear tutor information to compare",
};

export const channelLabels: Same<typeof channelLabelsVi> = {
  phone: "Phone call",
  zalo: "Zalo",
  email: "Email",
  messenger: "Facebook Messenger",
};

export const slotLabels: Same<typeof slotLabelsVi> = {
  weekday_morning: "Weekday mornings",
  weekday_afternoon: "Weekday afternoons",
  weekday_evening: "Weekday evenings",
  weekend_morning: "Weekend mornings",
  weekend_afternoon: "Weekend afternoons",
  weekend_evening: "Weekend evenings",
};

export const teachingAreaLabels: Same<typeof teachingAreaLabelsVi> = {
  foundation: "Foundation English",
  communication: "English conversation",
  vstep: "VSTEP preparation (B1/B2)",
  work: "Interviews or work",
  ielts: "IELTS preparation",
  toeic: "TOEIC preparation",
  other: "Other content",
};

export const tutorLevelLabels: Same<typeof tutorLevelLabelsVi> = {
  beginner: "Beginner / starting over",
  basic: "Elementary",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const experienceLabels: Same<typeof experienceLabelsVi> = {
  under_1: "Under 1 year",
  one_to_two: "1–2 years",
  three_to_five: "3–5 years",
  over_5: "Over 5 years",
};

export const educationLabels: Same<typeof educationLabelsVi> = {
  student: "University / college student",
  bachelor: "Bachelor's degree",
  postgraduate: "Master's degree or higher",
};

export const certificateLabels: Same<typeof certificateLabelsVi> = {
  ielts: "IELTS",
  toeic: "TOEIC",
  vstep: "VSTEP",
  toefl: "TOEFL iBT",
  cambridge: "Cambridge English",
  tesol: "TESOL / TEFL",
  celta: "CELTA",
  other: "Other certificate",
};

export { labelOf } from "../../shared/lib/options.ts";

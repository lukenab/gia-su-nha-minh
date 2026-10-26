import type { WizardStep } from "@/shared/forms/wizard";

import { goalLabels } from "../../shared/lib/options.ts";

export const steps: WizardStep[] = [
  {
    id: "goal",
    title: "Mục tiêu học tập",
    description: "Cho chúng tôi biết bạn muốn học gì và đang ở trình độ nào.",
  },
  {
    id: "schedule",
    title: "Lịch học và ngân sách",
    description: "Thông tin giúp tìm gia sư có lịch dạy và học phí phù hợp.",
  },
  {
    id: "contact",
    title: "Thông tin liên hệ",
    description: "Đội ngũ sẽ liên hệ với bạn trong vòng 24 giờ.",
  },
];

export const budgetOptions = [
  { value: "100000", label: "100.000đ" },
  { value: "150000", label: "150.000đ" },
  { value: "200000", label: "200.000đ" },
  { value: "250000", label: "250.000đ" },
  { value: "custom", label: "Mức khác" },
  { value: "unknown", label: "Chưa xác định" },
];

export const goalHints: Partial<Record<keyof typeof goalLabels, string>> = {
  foundation: "Lấy lại gốc, ngữ pháp, từ vựng",
  communication: "Nói tự tin trong học tập, đời sống",
  work: "Phỏng vấn, thuyết trình, email",
  ielts: "Theo band điểm mục tiêu",
  toeic: "Theo mức điểm cần đạt",
  unsure: "Đội ngũ sẽ cùng bạn xác định",
};

export type State = {
  goal: string;
  currentLevel: string;
  concerns: string[];
  format: string;
  availabilitySlots: string[];
  availabilityNote: string;
  startTime: string;
  budgetChoice: string;
  budgetCustom: string;
  location: string;
  fullName: string;
  phone: string;
  email: string;
  preferredChannel: string;
  notes: string;
  consent: boolean;
  website: string;
};

export type Errors = Partial<Record<keyof State | "budget", string>>;

export function initialState(initialGoal?: string): State {
  return {
    goal: initialGoal && initialGoal in goalLabels ? initialGoal : "",
    currentLevel: "",
    concerns: [],
    format: "",
    availabilitySlots: [],
    availabilityNote: "",
    startTime: "",
    budgetChoice: "",
    budgetCustom: "",
    location: "",
    fullName: "",
    phone: "",
    email: "",
    preferredChannel: "",
    notes: "",
    consent: false,
    website: "",
  };
}

export type StepProps = {
  s: State;
  errors: Errors;
  set: <K extends keyof State>(key: K, value: State[K]) => void;
};

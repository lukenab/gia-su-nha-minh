import type { WizardStep } from "@/shared/forms/wizard";

export const steps: WizardStep[] = [
  {
    id: "teaching",
    title: "Chuyên môn giảng dạy",
    description:
      "Nội dung bạn dạy tốt nhất và nhóm người học bạn tự tin hỗ trợ.",
  },
  {
    id: "experience",
    title: "Kinh nghiệm và lịch dạy",
    description:
      "Thông tin giúp giới thiệu người học phù hợp với thế mạnh của bạn.",
  },
  {
    id: "contact",
    title: "Thông tin liên hệ",
    description:
      "Đội ngũ sẽ liên hệ trong vòng 24 giờ để trao đổi và kiểm tra hồ sơ.",
  },
];

export const feeOptions = [
  { value: "100000", label: "100.000đ" },
  { value: "150000", label: "150.000đ" },
  { value: "200000", label: "200.000đ" },
  { value: "250000", label: "250.000đ" },
  { value: "custom", label: "Mức khác" },
  { value: "negotiable", label: "Thỏa thuận" },
];

export type State = {
  teachingAreas: string[];
  learnerLevels: string[];
  format: string;
  feeChoice: string;
  feeCustom: string;
  experience: string;
  experienceNote: string;
  certificates: string;
  availabilitySlots: string[];
  area: string;
  fullName: string;
  phone: string;
  email: string;
  preferredChannel: string;
  consent: boolean;
  website: string;
};

export type Errors = Partial<Record<keyof State, string>>;

export function initialState(): State {
  return {
    teachingAreas: [],
    learnerLevels: [],
    format: "",
    feeChoice: "",
    feeCustom: "",
    experience: "",
    experienceNote: "",
    certificates: "",
    availabilitySlots: [],
    area: "",
    fullName: "",
    phone: "",
    email: "",
    preferredChannel: "",
    consent: false,
    website: "",
  };
}

export type StepProps = {
  s: State;
  errors: Errors;
  set: <K extends keyof State>(key: K, value: State[K]) => void;
};

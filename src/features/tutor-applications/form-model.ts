import type { WizardStep } from "@/shared/forms/wizard";

export const steps: WizardStep[] = [
  {
    id: "basics",
    title: "Thông tin cơ bản",
    short: "Cơ bản",
    description:
      "Thông tin liên hệ và học vấn. Đội ngũ sẽ đối chiếu bản gốc chứng chỉ khi trao đổi trực tiếp với Anh/Chị.",
  },
  {
    id: "teaching",
    title: "Giảng dạy",
    description:
      "Nội dung, đối tượng học viên, hình thức, lịch dạy và học phí dự kiến.",
  },
  {
    id: "profile",
    title: "Giới thiệu",
    description:
      "Không bắt buộc. Ảnh và phần giới thiệu chỉ dùng nội bộ, và chỉ được gửi cho người học khi đội ngũ giới thiệu Anh/Chị.",
  },
  {
    id: "review",
    title: "Xem lại và gửi",
    short: "Xem lại",
    description: "Vui lòng kiểm tra lại thông tin trước khi gửi hồ sơ.",
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

export type CertificateRow = {
  type: string;
  name: string;
  score: string;
};

export type State = {
  fullName: string;
  email: string;
  phone: string;
  phoneHasZalo: boolean;
  education: string;
  school: string;
  certificates: CertificateRow[];
  teachingAreas: string[];
  otherTeachingArea: string;
  learnerLevels: string[];
  experience: string;
  format: string;
  area: string;
  availabilitySlots: string[];
  feeChoice: string;
  feeCustom: string;
  photo: string;
  bio: string;
  consentPrivacy: boolean;
  website: string;
};

/** Errors by field; certificate rows use keys like "certificates.0.name". */
export type Errors = Partial<Record<keyof State | string, string>>;

export function emptyCertificate(): CertificateRow {
  return { type: "", name: "", score: "" };
}

export function initialState(): State {
  return {
    fullName: "",
    email: "",
    phone: "",
    phoneHasZalo: false,
    education: "",
    school: "",
    certificates: [],
    teachingAreas: [],
    otherTeachingArea: "",
    learnerLevels: [],
    experience: "",
    format: "",
    area: "",
    availabilitySlots: [],
    feeChoice: "",
    feeCustom: "",
    photo: "",
    bio: "",
    consentPrivacy: false,
    website: "",
  };
}

export type StepProps = {
  s: State;
  errors: Errors;
  set: <K extends keyof State>(key: K, value: State[K]) => void;
};

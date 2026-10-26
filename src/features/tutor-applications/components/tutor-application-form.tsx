"use client";

import Link from "next/link";
import { useState } from "react";

import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import { PRIVACY_HREF } from "@/shared/config/site";
import {
  ChoiceGroup,
  Honeypot,
  TextField,
  toOptions,
} from "@/shared/forms/fields";
import styles from "@/shared/forms/form.module.css";
import { SuccessPanel } from "@/shared/forms/success-panel";
import {
  focusFirstError,
  Wizard,
  type WizardStep,
} from "@/shared/forms/wizard";
import {
  channelLabels,
  experienceLabels,
  slotLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "@/shared/lib/options";

const steps: WizardStep[] = [
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

const feeOptions = [
  { value: "100000", label: "100.000đ" },
  { value: "150000", label: "150.000đ" },
  { value: "200000", label: "200.000đ" },
  { value: "250000", label: "250.000đ" },
  { value: "custom", label: "Mức khác" },
  { value: "negotiable", label: "Thỏa thuận" },
];

type State = {
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

type Errors = Partial<Record<keyof State, string>>;

const phonePattern = /^\+?[0-9\s().-]{9,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(step: number, s: State): Errors {
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

const fieldOrder: (keyof Errors)[] = [
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

export function TutorApplicationForm() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [s, setState] = useState<State>({
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
  });

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function submit() {
    setSubmitting(true);
    setFormError("");
    const expectedFee =
      s.feeChoice === "negotiable"
        ? null
        : Number(
            s.feeChoice === "custom"
              ? s.feeCustom.replace(/\D/g, "")
              : s.feeChoice,
          );
    try {
      const response = await fetch("/api/tutor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: s.fullName.trim(),
          email: s.email.trim(),
          phone: s.phone.trim(),
          preferredChannel: s.preferredChannel,
          teachingAreas: s.teachingAreas,
          learnerLevels: s.learnerLevels,
          experience: s.experience,
          experienceNote: s.experienceNote.trim(),
          certificates: s.certificates.trim(),
          format: s.format,
          area: s.area.trim(),
          availabilitySlots: s.availabilitySlots,
          expectedFee,
          consent: s.consent,
          website: s.website,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Chưa thể gửi hồ sơ lúc này.");
      setReferenceCode(result.referenceCode);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : "Chưa thể gửi hồ sơ lúc này.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    const found = validate(step, s);
    setErrors(found);
    const invalid = fieldOrder.filter((key) => found[key]);
    if (invalid.length) {
      focusFirstError(invalid.map((key) => `ta-${key}`));
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
    else void submit();
  }

  if (referenceCode) {
    return (
      <SuccessPanel
        title="Đã nhận hồ sơ của bạn!"
        text="Cảm ơn bạn đã quan tâm trở thành gia sư cùng Gia Sư Nhà Mình."
        referenceCode={referenceCode}
        nextSteps={[
          "Trong vòng 24 giờ, đội ngũ liên hệ qua kênh bạn đã chọn.",
          "Bạn gửi giấy tờ để đội ngũ kiểm tra danh tính, chứng chỉ và kinh nghiệm.",
          "Khi có người học phù hợp với thế mạnh của bạn, chúng tôi sẽ giới thiệu để hai bên trao đổi.",
        ]}
      />
    );
  }

  return (
    <Wizard
      steps={steps}
      current={step}
      onBack={() => {
        setErrors({});
        setStep(step - 1);
      }}
      onNext={next}
      submitting={submitting}
      submitLabel="Gửi hồ sơ"
      formError={formError}
    >
      {step === 0 && (
        <>
          <ChoiceGroup
            id="ta-teachingAreas"
            legend="Nội dung bạn có kinh nghiệm giảng dạy"
            hint="Có thể chọn nhiều."
            required
            multiple
            options={toOptions(teachingAreaLabels)}
            value={s.teachingAreas}
            onChange={(value) => set("teachingAreas", value)}
            error={errors.teachingAreas}
          />
          <ChoiceGroup
            id="ta-learnerLevels"
            legend="Trình độ người học bạn tự tin hỗ trợ"
            hint="Có thể chọn nhiều."
            required
            multiple
            variant="chips"
            options={toOptions(tutorLevelLabels)}
            value={s.learnerLevels}
            onChange={(value) => set("learnerLevels", value)}
            error={errors.learnerLevels}
          />
          <ChoiceGroup
            id="ta-format"
            legend="Hình thức dạy"
            required
            options={toOptions(tutorFormatLabels)}
            value={s.format}
            onChange={(value) => set("format", value)}
            error={errors.format}
          />
          <ChoiceGroup
            id="ta-feeChoice"
            legend="Học phí mong muốn cho một buổi 60 phút"
            required
            variant="chips"
            options={feeOptions}
            value={s.feeChoice}
            onChange={(value) => set("feeChoice", value)}
            error={errors.feeChoice}
          />
          {s.feeChoice === "custom" && (
            <TextField
              id="ta-feeCustom"
              label="Mức học phí của bạn"
              required
              inputMode="numeric"
              placeholder="Ví dụ: 180000"
              suffix="đ / buổi"
              value={s.feeCustom}
              onChange={(value) => set("feeCustom", value)}
              error={errors.feeCustom}
            />
          )}
        </>
      )}

      {step === 1 && (
        <>
          <ChoiceGroup
            id="ta-experience"
            legend="Số năm kinh nghiệm dạy tiếng Anh"
            required
            variant="chips"
            options={toOptions(experienceLabels)}
            value={s.experience}
            onChange={(value) => set("experience", value)}
            error={errors.experience}
          />
          <TextField
            id="ta-experienceNote"
            label="Mô tả ngắn kinh nghiệm và cách dạy của bạn"
            required
            multiline
            placeholder="Ví dụ: 2 năm dạy giao tiếp cho sinh viên, tập trung phản xạ nói qua tình huống thực tế"
            value={s.experienceNote}
            onChange={(value) => set("experienceNote", value)}
            error={errors.experienceNote}
            maxLength={600}
          />
          <TextField
            id="ta-certificates"
            label="Chứng chỉ tiếng Anh hoặc sư phạm"
            hint="Bạn sẽ gửi bản chụp để đội ngũ kiểm tra ở bước sau."
            placeholder="Ví dụ: IELTS 7.5, TESOL"
            value={s.certificates}
            onChange={(value) => set("certificates", value)}
            maxLength={300}
          />
          <ChoiceGroup
            id="ta-availabilitySlots"
            legend="Khung giờ bạn có thể dạy"
            required
            multiple
            variant="chips"
            options={toOptions(slotLabels)}
            value={s.availabilitySlots}
            onChange={(value) => set("availabilitySlots", value)}
            error={errors.availabilitySlots}
          />
          {s.format !== "online" && (
            <TextField
              id="ta-area"
              label="Khu vực có thể dạy trực tiếp"
              placeholder="Ví dụ: Ninh Kiều, Cái Răng"
              value={s.area}
              onChange={(value) => set("area", value)}
              maxLength={120}
            />
          )}
        </>
      )}

      {step === 2 && (
        <>
          <TextField
            id="ta-fullName"
            label="Họ và tên"
            required
            autoComplete="name"
            value={s.fullName}
            onChange={(value) => set("fullName", value)}
            error={errors.fullName}
            maxLength={80}
          />
          <ChoiceGroup
            id="ta-preferredChannel"
            legend="Bạn muốn được liên hệ qua"
            required
            variant="chips"
            options={toOptions(channelLabels)}
            value={s.preferredChannel}
            onChange={(value) => set("preferredChannel", value)}
            error={errors.preferredChannel}
          />
          <div className={styles.row}>
            <TextField
              id="ta-phone"
              label="Số điện thoại"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required={["phone", "zalo"].includes(s.preferredChannel)}
              value={s.phone}
              onChange={(value) => set("phone", value)}
              error={errors.phone}
            />
            <TextField
              id="ta-email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required={s.preferredChannel === "email"}
              value={s.email}
              onChange={(value) => set("email", value)}
              error={errors.email}
            />
          </div>
          <label
            className={styles.consent}
            data-invalid={errors.consent ? true : undefined}
          >
            <input
              id="ta-consent"
              type="checkbox"
              checked={s.consent}
              onChange={(event) => set("consent", event.target.checked)}
              aria-describedby={errors.consent ? "ta-consent-error" : undefined}
            />
            <span>
              Tôi đồng ý để Gia Sư Nhà Mình sử dụng thông tin trên để liên hệ,
              kiểm tra hồ sơ và giới thiệu người học phù hợp, theo{" "}
              <Link href={PRIVACY_HREF} target="_blank">
                Chính sách bảo mật
              </Link>
              .
            </span>
          </label>
          {errors.consent && (
            <p id="ta-consent-error" className={styles.error} role="alert">
              {errors.consent}
            </p>
          )}
          <Honeypot
            value={s.website}
            onChange={(value) => set("website", value)}
          />
        </>
      )}
    </Wizard>
  );
}

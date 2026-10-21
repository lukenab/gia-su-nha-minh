"use client";

import Link from "next/link";
import { useState } from "react";

import { PRIVACY_HREF } from "@/components/landing/site";
import {
  channelLabels,
  concernLabels,
  formatLabels,
  goalLabels,
  levelLabels,
  slotLabels,
  startLabels,
} from "@/lib/options";

import { ChoiceGroup, Honeypot, TextField, toOptions } from "./fields";
import styles from "./form.module.css";
import { SuccessPanel } from "./success-panel";
import { focusFirstError, Wizard, type WizardStep } from "./wizard";

const steps: WizardStep[] = [
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

const budgetOptions = [
  { value: "100000", label: "100.000đ" },
  { value: "150000", label: "150.000đ" },
  { value: "200000", label: "200.000đ" },
  { value: "250000", label: "250.000đ" },
  { value: "custom", label: "Mức khác" },
  { value: "unknown", label: "Chưa xác định" },
];

const goalHints: Partial<Record<keyof typeof goalLabels, string>> = {
  foundation: "Lấy lại gốc, ngữ pháp, từ vựng",
  communication: "Nói tự tin trong học tập, đời sống",
  work: "Phỏng vấn, thuyết trình, email",
  ielts: "Theo band điểm mục tiêu",
  toeic: "Theo mức điểm cần đạt",
  unsure: "Đội ngũ sẽ cùng bạn xác định",
};

type State = {
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

type Errors = Partial<Record<keyof State | "budget", string>>;

const phonePattern = /^\+?[0-9\s().-]{9,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(step: number, s: State): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!s.goal) e.goal = "Vui lòng chọn mục tiêu học.";
    if (!s.currentLevel) e.currentLevel = "Vui lòng chọn trình độ hiện tại.";
  }
  if (step === 1) {
    if (!s.format) e.format = "Vui lòng chọn hình thức học.";
    if (!s.availabilitySlots.length)
      e.availabilitySlots = "Vui lòng chọn ít nhất một khung giờ.";
    if (!s.startTime) e.startTime = "Vui lòng chọn thời điểm bắt đầu.";
    if (!s.budgetChoice) e.budgetChoice = "Vui lòng chọn mức ngân sách.";
    if (s.budgetChoice === "custom") {
      const amount = Number(s.budgetCustom.replace(/\D/g, ""));
      if (!amount || amount > 2_000_000)
        e.budgetCustom = "Nhập học phí từ 1 đến 2.000.000 đồng.";
    }
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
    if (!s.consent) e.consent = "Vui lòng đồng ý để chúng tôi xử lý yêu cầu.";
  }
  return e;
}

const fieldOrder: (keyof Errors)[] = [
  "goal",
  "currentLevel",
  "format",
  "availabilitySlots",
  "startTime",
  "budgetChoice",
  "budgetCustom",
  "fullName",
  "preferredChannel",
  "phone",
  "email",
  "consent",
];

export function LearnerRequestForm({ initialGoal }: { initialGoal?: string }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [s, setState] = useState<State>({
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
  });

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function submit() {
    setSubmitting(true);
    setFormError("");
    const budgetMax =
      s.budgetChoice === "unknown"
        ? null
        : Number(
            s.budgetChoice === "custom"
              ? s.budgetCustom.replace(/\D/g, "")
              : s.budgetChoice,
          );
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: s.fullName.trim(),
          email: s.email.trim(),
          phone: s.phone.trim(),
          preferredChannel: s.preferredChannel,
          goal: s.goal,
          currentLevel: s.currentLevel,
          concerns: s.concerns,
          format: s.format,
          startTime: s.startTime,
          budgetMax,
          availabilitySlots: s.availabilitySlots,
          availabilityNote: s.availabilityNote.trim(),
          location: s.location.trim(),
          notes: s.notes.trim(),
          consent: s.consent,
          website: s.website,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Chưa thể gửi yêu cầu lúc này.");
      setReferenceCode(result.referenceCode);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : "Chưa thể gửi yêu cầu lúc này.",
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
      focusFirstError(invalid.map((key) => `lr-${key}`));
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
    else void submit();
  }

  if (referenceCode) {
    return (
      <SuccessPanel
        title="Đã nhận yêu cầu của bạn!"
        text="Cảm ơn bạn đã chia sẻ nhu cầu học tiếng Anh với Gia Sư Nhà Mình."
        referenceCode={referenceCode}
        nextSteps={[
          "Trong vòng 24 giờ, đội ngũ liên hệ qua kênh bạn đã chọn để xác nhận nhu cầu.",
          "Chúng tôi đối chiếu với các gia sư đã được kiểm tra danh tính, chứng chỉ và kinh nghiệm.",
          "Bạn xem thông tin gia sư, trao đổi trực tiếp rồi tự quyết định bắt đầu học.",
        ]}
      />
    );
  }

  const showLocation = s.format === "in_person" || s.format === "either";

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
      submitLabel="Gửi yêu cầu"
      formError={formError}
    >
      {step === 0 && (
        <>
          <ChoiceGroup
            id="lr-goal"
            legend="Bạn muốn học tiếng Anh để làm gì?"
            required
            options={(Object.keys(goalLabels) as (keyof typeof goalLabels)[])
              .filter((key) => key !== "other")
              .map((key) => ({
                value: key,
                label: goalLabels[key],
                hint: goalHints[key],
              }))}
            value={s.goal}
            onChange={(value) => set("goal", value)}
            error={errors.goal}
          />
          <ChoiceGroup
            id="lr-currentLevel"
            legend="Trình độ hiện tại của bạn"
            required
            variant="chips"
            options={toOptions(levelLabels)}
            value={s.currentLevel}
            onChange={(value) => set("currentLevel", value)}
            error={errors.currentLevel}
          />
          <ChoiceGroup
            id="lr-concerns"
            legend="Điều bạn quan tâm nhất khi chọn gia sư"
            hint="Có thể chọn nhiều."
            multiple
            variant="chips"
            options={toOptions(concernLabels)}
            value={s.concerns}
            onChange={(value) => set("concerns", value)}
          />
        </>
      )}

      {step === 1 && (
        <>
          <ChoiceGroup
            id="lr-format"
            legend="Hình thức học"
            required
            columns={4}
            options={toOptions(formatLabels)}
            value={s.format}
            onChange={(value) => set("format", value)}
            error={errors.format}
          />
          <ChoiceGroup
            id="lr-availabilitySlots"
            legend="Khung giờ bạn có thể học"
            hint="Chọn tất cả khung giờ phù hợp."
            required
            multiple
            variant="chips"
            options={toOptions(slotLabels)}
            value={s.availabilitySlots}
            onChange={(value) => set("availabilitySlots", value)}
            error={errors.availabilitySlots}
          />
          <TextField
            id="lr-availabilityNote"
            label="Ghi chú về lịch học"
            placeholder="Ví dụ: tối thứ 2, 4, 6 sau 19:00"
            value={s.availabilityNote}
            onChange={(value) => set("availabilityNote", value)}
            maxLength={300}
          />
          <ChoiceGroup
            id="lr-startTime"
            legend="Bạn muốn bắt đầu khi nào?"
            required
            variant="chips"
            options={toOptions(startLabels)}
            value={s.startTime}
            onChange={(value) => set("startTime", value)}
            error={errors.startTime}
          />
          <ChoiceGroup
            id="lr-budgetChoice"
            legend="Học phí tối đa cho một buổi 60 phút"
            hint="Chọn mức gần nhất hoặc nhập mức khác. Học phí cuối cùng do bạn và gia sư thống nhất."
            required
            variant="chips"
            options={budgetOptions}
            value={s.budgetChoice}
            onChange={(value) => set("budgetChoice", value)}
            error={errors.budgetChoice}
          />
          {s.budgetChoice === "custom" && (
            <TextField
              id="lr-budgetCustom"
              label="Mức học phí của bạn"
              required
              inputMode="numeric"
              placeholder="Ví dụ: 180000"
              suffix="đ / buổi"
              value={s.budgetCustom}
              onChange={(value) => set("budgetCustom", value)}
              error={errors.budgetCustom}
            />
          )}
          {showLocation && (
            <TextField
              id="lr-location"
              label="Khu vực học trực tiếp"
              placeholder="Ví dụ: Ninh Kiều, Cần Thơ"
              value={s.location}
              onChange={(value) => set("location", value)}
              maxLength={120}
            />
          )}
        </>
      )}

      {step === 2 && (
        <>
          <TextField
            id="lr-fullName"
            label="Họ và tên"
            required
            autoComplete="name"
            value={s.fullName}
            onChange={(value) => set("fullName", value)}
            error={errors.fullName}
            maxLength={80}
          />
          <ChoiceGroup
            id="lr-preferredChannel"
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
              id="lr-phone"
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
              id="lr-email"
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
          <TextField
            id="lr-notes"
            label="Bạn muốn chia sẻ thêm điều gì?"
            multiline
            placeholder="Ví dụ: cần chuẩn bị phỏng vấn thực tập trong 2 tháng tới"
            value={s.notes}
            onChange={(value) => set("notes", value)}
            maxLength={500}
          />
          <label
            className={styles.consent}
            data-invalid={errors.consent ? true : undefined}
          >
            <input
              id="lr-consent"
              type="checkbox"
              checked={s.consent}
              onChange={(event) => set("consent", event.target.checked)}
              aria-describedby={errors.consent ? "lr-consent-error" : undefined}
            />
            <span>
              Tôi đồng ý để Gia Sư Nhà Mình sử dụng thông tin trên để liên hệ và
              hỗ trợ tìm gia sư, theo{" "}
              <Link href={PRIVACY_HREF} target="_blank">
                Chính sách bảo mật
              </Link>
              .
            </span>
          </label>
          {errors.consent && (
            <p id="lr-consent-error" className={styles.error} role="alert">
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

"use client";

import { useState } from "react";

import { SuccessPanel } from "@/shared/forms/success-panel";
import { focusFirstError, Wizard } from "@/shared/forms/wizard";

import { initialState, steps, type Errors, type State } from "../form-model.ts";
import { fieldOrder, validate } from "../form-validation.ts";
import { submitLearnerRequest } from "../submit.ts";
import { ContactStep } from "./steps/contact-step";
import { GoalStep } from "./steps/goal-step";
import { ScheduleStep } from "./steps/schedule-step";

export function LearnerRequestForm({ initialGoal }: { initialGoal?: string }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [s, setState] = useState<State>(() => initialState(initialGoal));

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function submit() {
    setSubmitting(true);
    setFormError("");
    try {
      setReferenceCode(await submitLearnerRequest(s));
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

  const stepProps = { s, errors, set };

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
      submitNote="Không cần tạo tài khoản để gửi yêu cầu."
      formError={formError}
    >
      {step === 0 && <GoalStep {...stepProps} />}
      {step === 1 && <ScheduleStep {...stepProps} />}
      {step === 2 && <ContactStep {...stepProps} />}
    </Wizard>
  );
}

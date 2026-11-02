"use client";

import { useState } from "react";

import { SuccessPanel } from "@/shared/forms/success-panel";
import { focusFirstError, Wizard } from "@/shared/forms/wizard";

import { initialState, steps, type Errors, type State } from "../form-model.ts";
import { fieldOrder, validate } from "../form-validation.ts";
import { submitTutorApplication } from "../submit.ts";
import { BasicsStep } from "./steps/basics-step";
import { ProfileStep } from "./steps/profile-step";
import { ReviewStep } from "./steps/review-step";
import { TeachingStep } from "./steps/teaching-step";

const REVIEW_STEP = steps.length - 1;

export function TutorApplicationForm() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  // Set when the person jumps back from the review page to fix one part.
  const [editing, setEditing] = useState(false);
  const [s, setState] = useState<State>(initialState);

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current, [key]: undefined };
      if (key === "certificates")
        for (const name of Object.keys(next))
          if (name.startsWith("certificates.")) delete next[name];
      return next;
    });
  };

  async function submit() {
    setSubmitting(true);
    setFormError("");
    try {
      setReferenceCode(await submitTutorApplication(s));
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
    const invalid = fieldOrder(found);
    if (invalid.length) {
      focusFirstError(invalid.map((key) => `ta-${key}`));
      return;
    }
    if (step === REVIEW_STEP) {
      void submit();
      return;
    }
    // After fixing one part from the review page, go straight back to it.
    setStep(editing ? REVIEW_STEP : step + 1);
    setEditing(false);
  }

  if (referenceCode) {
    return (
      <SuccessPanel
        title="Gia Sư Nhà Mình đã nhận hồ sơ của Anh/Chị"
        text="Cảm ơn Anh/Chị đã quan tâm trở thành gia sư cùng Gia Sư Nhà Mình."
        referenceCode={referenceCode}
        nextSteps={[
          "Trong vòng 24 giờ, đội ngũ sẽ liên hệ qua số điện thoại hoặc email Anh/Chị đã cung cấp.",
          "Anh/Chị trao đổi với đội ngũ và xuất trình bản gốc giấy tờ, chứng chỉ để xác minh danh tính, chứng chỉ và kinh nghiệm.",
          "Khi có người học phù hợp với thế mạnh của Anh/Chị, đội ngũ sẽ giới thiệu để hai bên trao đổi.",
        ]}
      />
    );
  }

  const stepProps = { s, errors, set };

  return (
    <Wizard
      compact
      steps={steps}
      current={step}
      onBack={() => {
        setErrors({});
        setEditing(false);
        setStep(step - 1);
      }}
      onNext={next}
      submitting={submitting}
      submitLabel="Gửi hồ sơ"
      formError={formError}
    >
      {step === 0 && <BasicsStep {...stepProps} />}
      {step === 1 && <TeachingStep {...stepProps} />}
      {step === 2 && <ProfileStep {...stepProps} />}
      {step === 3 && (
        <ReviewStep
          {...stepProps}
          onEdit={(target) => {
            setErrors({});
            setEditing(true);
            setStep(target);
          }}
        />
      )}
    </Wizard>
  );
}

"use client";

import { useState } from "react";

import { SuccessPanel } from "@/shared/forms/success-panel";
import { focusFirstError, Wizard } from "@/shared/forms/wizard";

import { initialState, steps, type Errors, type State } from "../form-model.ts";
import { fieldOrder, validate } from "../form-validation.ts";
import { submitTutorApplication } from "../submit.ts";
import { ContactStep } from "./steps/contact-step";
import { ExperienceStep } from "./steps/experience-step";
import { TeachingStep } from "./steps/teaching-step";

export function TutorApplicationForm() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [s, setState] = useState<State>(initialState);

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
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
      submitLabel="Gửi hồ sơ"
      formError={formError}
    >
      {step === 0 && <TeachingStep {...stepProps} />}
      {step === 1 && <ExperienceStep {...stepProps} />}
      {step === 2 && <ContactStep {...stepProps} />}
    </Wizard>
  );
}

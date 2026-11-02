import { TextField } from "@/shared/forms/fields";

import { type StepProps } from "../../form-model.ts";
import { BIO_MAX } from "../../limits.ts";
import { PhotoField } from "../photo-field";
import local from "../tutor-form.module.css";

export function ProfileStep({ s, errors, set }: StepProps) {
  return (
    <>
      <PhotoField
        value={s.photo}
        onChange={(value) => set("photo", value)}
        error={errors.photo}
      />
      <div>
        <TextField
          id="ta-bio"
          label="Giới thiệu bản thân"
          hint="2–3 câu về kinh nghiệm giảng dạy, phương pháp hoặc thành tích của học viên. Anh/Chị có thể bổ sung khi trao đổi với đội ngũ."
          multiline
          rows={5}
          value={s.bio}
          onChange={(value) => set("bio", value)}
          error={errors.bio}
          maxLength={BIO_MAX}
        />
        <p className={local.counter} aria-live="polite">
          {s.bio.trim().length}/{BIO_MAX} ký tự
        </p>
      </div>
    </>
  );
}

import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import { ChoiceGroup, TextField, toOptions } from "@/shared/forms/fields";
import { teachingAreaLabels, tutorLevelLabels } from "@/shared/lib/options";

import { feeOptions, type StepProps } from "../../form-model.ts";

export function TeachingStep({ s, errors, set }: StepProps) {
  return (
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
  );
}

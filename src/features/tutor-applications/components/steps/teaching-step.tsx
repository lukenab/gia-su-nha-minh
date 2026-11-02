import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import { ChoiceGroup, TextField, toOptions } from "@/shared/forms/fields";
import {
  experienceLabels,
  slotLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "@/shared/lib/options";

import { feeOptions, type StepProps } from "../../form-model.ts";

export function TeachingStep({ s, errors, set }: StepProps) {
  return (
    <>
      <ChoiceGroup
        id="ta-teachingAreas"
        legend="Nội dung có thể giảng dạy"
        hint="Có thể chọn nhiều nội dung."
        required
        multiple
        options={toOptions(teachingAreaLabels)}
        value={s.teachingAreas}
        onChange={(value) => set("teachingAreas", value)}
        error={errors.teachingAreas}
      />
      {s.teachingAreas.includes("other") && (
        <TextField
          id="ta-otherTeachingArea"
          label="Nội dung khác"
          required
          value={s.otherTeachingArea}
          onChange={(v) => set("otherTeachingArea", v)}
          error={errors.otherTeachingArea}
          maxLength={300}
        />
      )}
      <ChoiceGroup
        id="ta-learnerLevels"
        legend="Trình độ học viên có thể nhận"
        hint="Có thể chọn nhiều trình độ."
        required
        multiple
        variant="chips"
        options={toOptions(tutorLevelLabels)}
        value={s.learnerLevels}
        onChange={(value) => set("learnerLevels", value)}
        error={errors.learnerLevels}
      />
      <ChoiceGroup
        id="ta-experience"
        legend="Thời gian giảng dạy tiếng Anh"
        required
        variant="chips"
        options={toOptions(experienceLabels)}
        value={s.experience}
        onChange={(value) => set("experience", value)}
        error={errors.experience}
      />
      <ChoiceGroup
        id="ta-format"
        legend="Hình thức giảng dạy"
        required
        options={toOptions(tutorFormatLabels)}
        value={s.format}
        onChange={(value) => set("format", value)}
        error={errors.format}
      />
      {s.format && s.format !== "online" && (
        <TextField
          id="ta-area"
          label="Khu vực có thể dạy trực tiếp"
          required
          error={errors.area}
          placeholder="Ví dụ: Ninh Kiều, Cái Răng"
          value={s.area}
          onChange={(value) => set("area", value)}
          maxLength={120}
        />
      )}
      <ChoiceGroup
        id="ta-availabilitySlots"
        legend="Khung giờ có thể giảng dạy"
        required
        multiple
        variant="chips"
        options={toOptions(slotLabels)}
        value={s.availabilitySlots}
        onChange={(value) => set("availabilitySlots", value)}
        error={errors.availabilitySlots}
      />
      <ChoiceGroup
        id="ta-feeChoice"
        legend="Học phí dự kiến cho một buổi 60 phút"
        hint="Gia sư không phải trả bất kỳ khoản phí nào cho Gia Sư Nhà Mình."
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
          label="Mức học phí dự kiến"
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

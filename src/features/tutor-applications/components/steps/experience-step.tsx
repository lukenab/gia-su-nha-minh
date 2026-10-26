import { ChoiceGroup, TextField, toOptions } from "@/shared/forms/fields";
import { experienceLabels, slotLabels } from "@/shared/lib/options";

import { type StepProps } from "../../form-model.ts";

export function ExperienceStep({ s, errors, set }: StepProps) {
  return (
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
  );
}

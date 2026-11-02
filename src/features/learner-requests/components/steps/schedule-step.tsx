import { ChoiceGroup, TextField, toOptions } from "@/shared/forms/fields";
import { formatLabels, slotLabels, startLabels } from "@/shared/lib/options";

import { budgetOptions, type StepProps } from "../../form-model.ts";

export function ScheduleStep({ s, errors, set }: StepProps) {
  const showLocation = s.format === "in_person" || s.format === "either";
  return (
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
  );
}

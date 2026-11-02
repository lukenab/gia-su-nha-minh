import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import { ChoiceGroup, TextField, toOptions } from "@/shared/forms/fields";
import styles from "@/shared/forms/form.module.css";
import {
  experienceLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "@/shared/lib/options";

import { type StepProps } from "../../form-model.ts";
import local from "../tutor-form.module.css";

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
      <fieldset
        id="ta-availabilitySlots"
        className={local.schedule}
        tabIndex={-1}
        aria-describedby={`ta-schedule-hint${errors.availabilitySlots ? " ta-schedule-error" : ""}`}
        aria-invalid={errors.availabilitySlots ? true : undefined}
      >
        <legend className={styles.label}>
          Thời gian có thể giảng dạy{" "}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </legend>
        <p id="ta-schedule-hint" className={styles.hint}>
          Chọn các khung giờ thường phù hợp. Lịch cụ thể sẽ được xác nhận khi
          trao đổi.
        </p>
        <table className={local.scheduleTable}>
          <thead>
            <tr>
              <td />
              <th scope="col">Sáng</th>
              <th scope="col">Chiều</th>
              <th scope="col">Tối</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: "weekday", label: "Thứ Hai–Thứ Sáu" },
              { key: "weekend", label: "Thứ Bảy–Chủ Nhật" },
            ].map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {[
                  { key: "morning", label: "Sáng" },
                  { key: "afternoon", label: "Chiều" },
                  { key: "evening", label: "Tối" },
                ].map((period) => {
                  const value = `${row.key}_${period.key}`;
                  const checked = s.availabilitySlots.includes(value);
                  return (
                    <td key={value}>
                      <label
                        className={local.scheduleCell}
                        data-checked={checked}
                      >
                        <input
                          type="checkbox"
                          aria-label={`${period.label}, ${row.label}`}
                          checked={checked}
                          onChange={() =>
                            set(
                              "availabilitySlots",
                              checked
                                ? s.availabilitySlots.filter(
                                    (slot) => slot !== value,
                                  )
                                : [...s.availabilitySlots, value],
                            )
                          }
                        />
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {errors.availabilitySlots && (
          <p id="ta-schedule-error" className={styles.error} role="alert">
            {errors.availabilitySlots}
          </p>
        )}
      </fieldset>
      <fieldset id="ta-feeChoice" className={local.schedule} tabIndex={-1}>
        <legend className={styles.label}>
          Học phí dự kiến{" "}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </legend>
        <p id="ta-fee-hint" className={styles.hint}>
          Đơn vị: VND / buổi 60 phút. Gia sư không phải trả phí kết nối.
        </p>
        {s.feeChoice !== "negotiable" && (
          <input
            id="ta-feeCustom"
            className={styles.input}
            aria-label="Học phí dự kiến (VND / buổi 60 phút)"
            aria-required="true"
            aria-describedby={`ta-fee-hint${errors.feeCustom || errors.feeChoice ? " ta-fee-error" : ""}`}
            aria-invalid={
              errors.feeCustom || errors.feeChoice ? true : undefined
            }
            inputMode="numeric"
            placeholder="Nhập số tiền"
            maxLength={7}
            value={
              s.feeChoice === "custom" || !s.feeChoice
                ? s.feeCustom
                : s.feeChoice
            }
            onChange={(event) => {
              set("feeChoice", "custom");
              set("feeCustom", event.target.value.replace(/\D/g, ""));
            }}
          />
        )}
        <label className={local.checkbox}>
          <input
            type="checkbox"
            checked={s.feeChoice === "negotiable"}
            onChange={(event) =>
              set("feeChoice", event.target.checked ? "negotiable" : "custom")
            }
          />
          Thỏa thuận học phí sau
        </label>
        {(errors.feeCustom || errors.feeChoice) && (
          <p id="ta-fee-error" className={styles.error} role="alert">
            {errors.feeCustom || errors.feeChoice}
          </p>
        )}
      </fieldset>
    </>
  );
}

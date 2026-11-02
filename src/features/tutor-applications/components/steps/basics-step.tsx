import { ChoiceGroup, TextField, toOptions } from "@/shared/forms/fields";
import styles from "@/shared/forms/form.module.css";
import { certificateLabels, educationLabels } from "@/shared/lib/options";

import {
  emptyCertificate,
  type CertificateRow,
  type StepProps,
} from "../../form-model.ts";
import local from "../tutor-form.module.css";

const MAX_CERTIFICATES = 8;

export function BasicsStep({ s, errors, set }: StepProps) {
  const update = (index: number, patch: Partial<CertificateRow>) =>
    set(
      "certificates",
      s.certificates.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    );

  return (
    <>
      <TextField
        id="ta-fullName"
        label="Họ và tên"
        hint="Ghi đầy đủ theo giấy tờ tùy thân."
        required
        autoComplete="name"
        value={s.fullName}
        onChange={(value) => set("fullName", value)}
        error={errors.fullName}
        maxLength={80}
      />
      <div className={styles.row}>
        <TextField
          id="ta-email"
          label="Email"
          hint="Dùng để gửi thông báo chính thức về hồ sơ."
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={s.email}
          onChange={(value) => set("email", value)}
          error={errors.email}
          maxLength={120}
        />
        <TextField
          id="ta-phone"
          label="Số điện thoại"
          hint="Đội ngũ sẽ gọi hoặc nhắn tin qua số này."
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={s.phone}
          onChange={(value) => set("phone", value)}
          error={errors.phone}
        />
      </div>
      <label className={local.checkbox}>
        <input
          id="ta-phoneHasZalo"
          type="checkbox"
          checked={s.phoneHasZalo}
          onChange={(event) => set("phoneHasZalo", event.target.checked)}
        />
        Số điện thoại này có sử dụng Zalo
      </label>

      <h3 className={local.subhead}>Học vấn</h3>
      <ChoiceGroup
        id="ta-education"
        legend="Trình độ học vấn"
        required
        options={toOptions(educationLabels)}
        value={s.education}
        onChange={(value) => set("education", value)}
        error={errors.education}
      />
      <TextField
        id="ta-school"
        label="Trường và chuyên ngành"
        placeholder="Ví dụ: Trường Đại học Cần Thơ – Ngôn ngữ Anh"
        required
        autoComplete="organization"
        value={s.school}
        onChange={(value) => set("school", value)}
        error={errors.school}
        maxLength={160}
      />

      <fieldset className={local.certificates}>
        <legend className={styles.label}>
          Chứng chỉ tiếng Anh hoặc sư phạm
          <span className={styles.optional}>(không bắt buộc)</span>
        </legend>
        <p className={styles.hint}>
          Anh/Chị chưa cần tải bản scan. Đội ngũ sẽ đối chiếu bản gốc khi trao
          đổi trực tiếp.
        </p>
        {s.certificates.map((row, index) => {
          const key = (field: string) => `certificates.${index}.${field}`;
          return (
            <div
              key={index}
              className={local.certificateRow}
              role="group"
              aria-label={`Chứng chỉ ${index + 1}`}
            >
              <div className={styles.field}>
                <label
                  className={local.smallLabel}
                  htmlFor={`ta-${key("type")}`}
                >
                  Loại chứng chỉ
                </label>
                <select
                  id={`ta-${key("type")}`}
                  className={styles.input}
                  value={row.type}
                  onChange={(event) =>
                    update(index, { type: event.target.value })
                  }
                  aria-invalid={errors[key("type")] ? true : undefined}
                >
                  <option value="">Chọn loại</option>
                  {Object.entries(certificateLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors[key("type")] && (
                  <p className={styles.error} role="alert">
                    {errors[key("type")]}
                  </p>
                )}
              </div>
              {row.type === "other" && (
                <div className={styles.field}>
                  <label
                    className={local.smallLabel}
                    htmlFor={`ta-${key("name")}`}
                  >
                    Tên chứng chỉ
                  </label>
                  <input
                    id={`ta-${key("name")}`}
                    className={styles.input}
                    value={row.name}
                    maxLength={60}
                    onChange={(event) =>
                      update(index, { name: event.target.value })
                    }
                    aria-invalid={errors[key("name")] ? true : undefined}
                  />
                  {errors[key("name")] && (
                    <p className={styles.error} role="alert">
                      {errors[key("name")]}
                    </p>
                  )}
                </div>
              )}
              <div className={styles.field}>
                <label
                  className={local.smallLabel}
                  htmlFor={`ta-${key("score")}`}
                >
                  Điểm / bậc
                </label>
                <input
                  id={`ta-${key("score")}`}
                  className={styles.input}
                  placeholder="Ví dụ: 7.5, 850, C1"
                  value={row.score}
                  maxLength={30}
                  onChange={(event) =>
                    update(index, { score: event.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className={local.remove}
                onClick={() =>
                  set(
                    "certificates",
                    s.certificates.filter((item) => item !== row),
                  )
                }
                aria-label={`Xóa chứng chỉ ${index + 1}`}
              >
                Xóa
              </button>
            </div>
          );
        })}
        {s.certificates.length < MAX_CERTIFICATES && (
          <button
            type="button"
            className={local.add}
            onClick={() =>
              set("certificates", [...s.certificates, emptyCertificate()])
            }
          >
            + Thêm chứng chỉ
          </button>
        )}
      </fieldset>
    </>
  );
}

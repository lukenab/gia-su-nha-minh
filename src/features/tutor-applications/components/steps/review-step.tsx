import Image from "next/image";
import Link from "next/link";

import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import { PRIVACY_HREF } from "@/shared/config/site";
import { Honeypot } from "@/shared/forms/fields";
import styles from "@/shared/forms/form.module.css";
import {
  certificateLabels,
  educationLabels,
  experienceLabels,
  labelOf,
  slotLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "@/shared/lib/options";

import { feeOptions, type State, type StepProps } from "../../form-model.ts";
import local from "../tutor-form.module.css";

const list = (labels: Record<string, string>, values: string[]) =>
  values.map((value) => labelOf(labels, value)).join(", ");

function fee(s: State) {
  if (s.feeChoice === "negotiable") return "Thỏa thuận";
  const amount =
    s.feeChoice === "custom"
      ? Number(s.feeCustom.replace(/\D/g, ""))
      : Number(s.feeChoice);
  return amount
    ? `${amount.toLocaleString("vi-VN")}đ / buổi 60 phút`
    : labelOf(
        Object.fromEntries(feeOptions.map((o) => [o.value, o.label])),
        s.feeChoice,
      );
}

function Section({
  title,
  step,
  onEdit,
  rows,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  rows: [string, string][];
}) {
  return (
    <section className={local.review}>
      <div className={local.reviewHead}>
        <h3>{title}</h3>
        <button
          type="button"
          className={local.edit}
          onClick={() => onEdit(step)}
          aria-label={`Sửa phần ${title.toLowerCase()}`}
        >
          Sửa
        </button>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Consent({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <label className={styles.consent} data-invalid={error ? true : undefined}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

export function ReviewStep({
  s,
  errors,
  set,
  onEdit,
}: StepProps & { onEdit: (step: number) => void }) {
  const certificates = s.certificates
    .filter((row) => row.type)
    .map((row) =>
      [
        row.type === "other" ? row.name : labelOf(certificateLabels, row.type),
        row.score,
      ]
        .filter(Boolean)
        .join(" "),
    )
    .join("; ");

  return (
    <>
      <div className={local.reviewTop}>
        {s.photo && (
          <Image
            className={local.reviewPhoto}
            src={s.photo}
            alt=""
            width={64}
            height={64}
            unoptimized
          />
        )}
        <div>
          <strong>{s.fullName}</strong>
          <span>{s.school}</span>
        </div>
      </div>
      <Section
        title="Thông tin cơ bản"
        step={0}
        onEdit={onEdit}
        rows={[
          ["Họ và tên", s.fullName],
          ["Email", s.email],
          ["Số điện thoại", `${s.phone}${s.phoneHasZalo ? " (có Zalo)" : ""}`],
          ["Trình độ học vấn", labelOf(educationLabels, s.education)],
          ["Trường và chuyên ngành", s.school],
          ["Chứng chỉ", certificates || "Chưa khai báo"],
        ]}
      />
      <Section
        title="Giảng dạy"
        step={1}
        onEdit={onEdit}
        rows={[
          [
            "Nội dung",
            [
              list(teachingAreaLabels, s.teachingAreas),
              s.otherTeachingArea.trim(),
            ]
              .filter(Boolean)
              .join(" · "),
          ],
          ["Trình độ học viên", list(tutorLevelLabels, s.learnerLevels)],
          ["Thời gian giảng dạy", labelOf(experienceLabels, s.experience)],
          [
            "Hình thức",
            [
              labelOf(tutorFormatLabels, s.format),
              s.format !== "online" ? s.area : "",
            ]
              .filter(Boolean)
              .join(" · "),
          ],
          ["Khung giờ", list(slotLabels, s.availabilitySlots)],
          ["Học phí dự kiến", fee(s)],
        ]}
      />
      <Section
        title="Giới thiệu"
        step={2}
        onEdit={onEdit}
        rows={[
          ["Ảnh chân dung", s.photo ? "Đã tải lên" : "Gửi sau"],
          ["Giới thiệu bản thân", s.bio.trim() || "Bổ sung sau"],
        ]}
      />

      <div className={local.consents}>
        <Consent
          id="ta-consentPrivacy"
          checked={s.consentPrivacy}
          onChange={(value) => set("consentPrivacy", value)}
          error={errors.consentPrivacy}
        >
          Tôi đồng ý để Gia Sư Nhà Mình xử lý thông tin và ảnh đã cung cấp để
          liên hệ, xác minh hồ sơ và giới thiệu người học theo{" "}
          <Link href={PRIVACY_HREF} target="_blank">
            Chính sách bảo mật
          </Link>
          . Tôi có thể rút lại sự đồng ý và yêu cầu xóa hồ sơ bất cứ lúc nào.
        </Consent>
        <p className={local.declaration}>
          Khi bấm “Gửi hồ sơ”, Anh/Chị xác nhận các thông tin trên là trung thực
          và đồng ý để đội ngũ xác minh danh tính, chứng chỉ và kinh nghiệm
          trước khi giới thiệu Anh/Chị cho người học.
        </p>
      </div>
      <Honeypot value={s.website} onChange={(value) => set("website", value)} />
    </>
  );
}

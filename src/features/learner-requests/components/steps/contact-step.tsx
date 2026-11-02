import Link from "next/link";

import { PRIVACY_HREF } from "@/shared/config/site";
import {
  ChoiceGroup,
  Honeypot,
  TextField,
  toOptions,
} from "@/shared/forms/fields";
import styles from "@/shared/forms/form.module.css";
import { channelLabels } from "@/shared/lib/options";

import type { StepProps } from "../../form-model.ts";

export function ContactStep({ s, errors, set }: StepProps) {
  return (
    <>
      <TextField
        id="lr-fullName"
        label="Họ và tên"
        required
        autoComplete="name"
        value={s.fullName}
        onChange={(value) => set("fullName", value)}
        error={errors.fullName}
        maxLength={80}
      />
      <ChoiceGroup
        id="lr-preferredChannel"
        legend="Bạn muốn được liên hệ qua"
        required
        variant="chips"
        options={toOptions(channelLabels)}
        value={s.preferredChannel}
        onChange={(value) => set("preferredChannel", value)}
        error={errors.preferredChannel}
      />
      <div className={styles.row}>
        <TextField
          id="lr-phone"
          label="Số điện thoại"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required={["phone", "zalo"].includes(s.preferredChannel)}
          value={s.phone}
          onChange={(value) => set("phone", value)}
          error={errors.phone}
        />
        <TextField
          id="lr-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required={s.preferredChannel === "email"}
          value={s.email}
          onChange={(value) => set("email", value)}
          error={errors.email}
        />
      </div>
      <TextField
        id="lr-notes"
        label="Bạn muốn chia sẻ thêm điều gì?"
        multiline
        placeholder="Ví dụ: cần chuẩn bị phỏng vấn thực tập trong 2 tháng tới"
        value={s.notes}
        onChange={(value) => set("notes", value)}
        maxLength={500}
      />
      <label
        className={styles.consent}
        data-invalid={errors.consent ? true : undefined}
      >
        <input
          id="lr-consent"
          type="checkbox"
          checked={s.consent}
          onChange={(event) => set("consent", event.target.checked)}
          aria-describedby={errors.consent ? "lr-consent-error" : undefined}
        />
        <span>
          Tôi đồng ý để Gia Sư Nhà Mình sử dụng thông tin trên để liên hệ và hỗ
          trợ tìm gia sư, theo{" "}
          <Link href={PRIVACY_HREF} target="_blank">
            Chính sách bảo mật
          </Link>
          .
        </span>
      </label>
      {errors.consent && (
        <p id="lr-consent-error" className={styles.error} role="alert">
          {errors.consent}
        </p>
      )}
      <Honeypot value={s.website} onChange={(value) => set("website", value)} />
    </>
  );
}

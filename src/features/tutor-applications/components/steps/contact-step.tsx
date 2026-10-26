import Link from "next/link";

import { PRIVACY_HREF } from "@/shared/config/site";
import {
  ChoiceGroup,
  TextField,
  Honeypot,
  toOptions,
} from "@/shared/forms/fields";
import styles from "@/shared/forms/form.module.css";
import { channelLabels } from "@/shared/lib/options";

import { type StepProps } from "../../form-model.ts";

export function ContactStep({ s, errors, set }: StepProps) {
  return (
    <>
      <TextField
        id="ta-fullName"
        label="Họ và tên"
        required
        autoComplete="name"
        value={s.fullName}
        onChange={(value) => set("fullName", value)}
        error={errors.fullName}
        maxLength={80}
      />
      <ChoiceGroup
        id="ta-preferredChannel"
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
          id="ta-phone"
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
          id="ta-email"
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
      <label
        className={styles.consent}
        data-invalid={errors.consent ? true : undefined}
      >
        <input
          id="ta-consent"
          type="checkbox"
          checked={s.consent}
          onChange={(event) => set("consent", event.target.checked)}
          aria-describedby={errors.consent ? "ta-consent-error" : undefined}
        />
        <span>
          Tôi đồng ý để Gia Sư Nhà Mình sử dụng thông tin trên để liên hệ, kiểm
          tra hồ sơ và giới thiệu người học phù hợp, theo{" "}
          <Link href={PRIVACY_HREF} target="_blank">
            Chính sách bảo mật
          </Link>
          .
        </span>
      </label>
      {errors.consent && (
        <p id="ta-consent-error" className={styles.error} role="alert">
          {errors.consent}
        </p>
      )}
      <Honeypot value={s.website} onChange={(value) => set("website", value)} />
    </>
  );
}

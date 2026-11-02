import Link from "next/link";

import { Check } from "@/features/landing/components/icons";
import { site } from "@/shared/config/site";

import styles from "./form.module.css";

export function SuccessPanel({
  title,
  text,
  referenceCode,
  nextSteps,
}: {
  title: string;
  text: string;
  referenceCode: string;
  nextSteps: string[];
}) {
  return (
    <section className={`${styles.panel} ${styles.success}`} aria-live="polite">
      <span className={styles.successIcon} aria-hidden="true">
        <Check />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className={styles.code}>
        <small>MÃ CỦA BẠN</small>
        <strong>{referenceCode}</strong>
        <span>Vui lòng lưu lại mã này để tiện trao đổi với đội ngũ.</span>
      </div>
      <h3>Tiếp theo</h3>
      <ol className={styles.nextSteps}>
        {nextSteps.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <div className={styles.successActions}>
        <Link className={styles.next} href="/">
          Về trang chủ
        </Link>
        <a
          className={styles.back}
          href={site.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Nhắn fanpage Gia Sư Nhà Mình
        </a>
      </div>
    </section>
  );
}

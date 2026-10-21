import Link from "next/link";

import { faq } from "./content";
import { ArrowUpRight } from "./icons";
import styles from "./landing.module.css";
import { PRIVACY_HREF, TUTOR_APPLICATION_HREF, site } from "./site";

/** Native <details> accordion: works without JavaScript and with keyboards. */
export function Faq() {
  return (
    <section className={styles.faq} id="cau-hoi" aria-labelledby="faq-title">
      <div className={`${styles.shell} ${styles.faqLayout}`}>
        <div className={styles.faqIntro} data-reveal>
          <span className={styles.sectionNo}>{faq.label}</span>
          <h2 id="faq-title">{faq.title}</h2>
          <p>
            Chưa thấy câu trả lời bạn cần? Nhắn tin cho{" "}
            <a
              href={site.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              fanpage Gia Sư Nhà Mình
              <span className={styles.srOnly}> (mở trong thẻ mới)</span>
            </a>
            .
          </p>
        </div>
        <div className={styles.faqList}>
          {faq.items.map((item, index) => (
            <details
              key={item.question}
              className={styles.faqItem}
              open={index === 0}
            >
              <summary>
                <span>{item.question}</span>
                <i aria-hidden="true" />
              </summary>
              <div className={styles.faqAnswer}>
                <p>{item.answer}</p>
                {item.link === "privacy" && (
                  <Link href={PRIVACY_HREF}>
                    Xem Chính sách bảo mật <ArrowUpRight />
                  </Link>
                )}
                {item.link === "tutor" && (
                  <Link href={TUTOR_APPLICATION_HREF}>
                    Điền hồ sơ gia sư <ArrowUpRight />
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

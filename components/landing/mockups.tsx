import { goalLabels } from "@/lib/options";

import { BrandMark } from "./brand-logo";
import { sampleRequest } from "./content";
import { Check, Clock, MapPin, Target, User } from "./icons";
import styles from "./landing.module.css";

/*
 * Illustrated device frames. They are decorative (hidden from assistive
 * technology) and never show real people, real data or real reference codes.
 */

const SAMPLE_CODE = "GSNM-20261021-••••";

type FrameProps = {
  className?: string;
  url: string;
  children: React.ReactNode;
};

export function BrowserFrame({ className = "", url, children }: FrameProps) {
  return (
    <div className={`${styles.browser} ${className}`} aria-hidden="true">
      <div className={styles.browserBar}>
        <i />
        <i />
        <i />
        <span>{url}</span>
      </div>
      {children}
    </div>
  );
}

export function PhoneFrame({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.phone} ${className}`} aria-hidden="true">
      <span className={styles.notch} />
      <div className={styles.phoneBody}>{children}</div>
    </div>
  );
}

function PhoneBrand() {
  return <BrandMark className={styles.phoneLogo} />;
}

export function PhoneRequestScreen() {
  return (
    <>
      <PhoneBrand />
      <small className={styles.phoneEyebrow}>YÊU CẦU TÌM GIA SƯ</small>
      <h3 className={styles.phoneTitle}>
        Bắt đầu từ
        <br />
        mục tiêu của bạn.
      </h3>
      <span className={`${styles.phoneChoice} ${styles.phoneChoiceActive}`}>
        <Target /> {goalLabels.communication}
      </span>
      <span className={styles.phoneChoice}>
        <Clock /> Buổi tối trong tuần
      </span>
      <span className={styles.phoneChoice}>
        <MapPin /> Cần Thơ hoặc trực tuyến
      </span>
      <span className={styles.phoneButton}>Gửi yêu cầu →</span>
    </>
  );
}

export function PhoneSuccessScreen() {
  return (
    <>
      <PhoneBrand />
      <span className={styles.phoneSuccessIcon}>
        <Check />
      </span>
      <small className={styles.phoneEyebrow}>ĐÃ GHI NHẬN YÊU CẦU</small>
      <h3 className={styles.phoneTitle}>
        Cảm ơn bạn đã
        <br />
        chia sẻ nhu cầu.
      </h3>
      <span className={styles.phoneCode}>
        <small>MÃ YÊU CẦU</small>
        <strong>{SAMPLE_CODE}</strong>
      </span>
      <span className={styles.phoneHint}>
        Đội ngũ sẽ liên hệ với bạn trong vòng 24 giờ.
      </span>
    </>
  );
}

export function PhoneChatScreen() {
  return (
    <>
      <div className={styles.chatHead}>
        <BrandMark className={styles.chatAvatar} />
        <div>
          <strong>Gia Sư Nhà Mình</strong>
          <small>Đội ngũ hỗ trợ</small>
        </div>
      </div>
      <div className={styles.chatThread}>
        <span data-from="team">
          Chào bạn, Gia Sư Nhà Mình đã nhận yêu cầu học giao tiếp của bạn.
        </span>
        <span data-from="team">
          Bạn có thể học buổi tối thứ mấy trong tuần?
        </span>
        <span data-from="me">Tối thứ 2 và thứ 4 ạ.</span>
        <span data-from="team">
          Cảm ơn bạn! Đội ngũ sẽ gửi thông tin gia sư phù hợp sớm nhất.
        </span>
      </div>
    </>
  );
}

export function TutorMatchScreen() {
  return (
    <div className={styles.matchScreen}>
      <div className={styles.matchProfile}>
        <span className={styles.matchAvatar}>
          <User />
        </span>
        <div>
          <small>GIA SƯ ĐỀ XUẤT</small>
          <strong>Thế mạnh: tiếng Anh giao tiếp</strong>
          <span>Buổi tối · Trực tiếp tại Cần Thơ</span>
        </div>
      </div>
      <ul className={styles.matchChecks}>
        <li>
          <Check /> Danh tính đã kiểm tra
        </li>
        <li>
          <Check /> Chứng chỉ đã kiểm tra
        </li>
        <li>
          <Check /> Kinh nghiệm đã kiểm tra
        </li>
      </ul>
      <div className={styles.matchFit}>
        <span>Phù hợp với yêu cầu của bạn</span>
        <b>{sampleRequest.goal}</b>
        <b>{sampleRequest.availability}</b>
      </div>
    </div>
  );
}

export function WebFormScreen() {
  const goals = [
    goalLabels.communication,
    goalLabels.foundation,
    goalLabels.ielts,
  ];
  return (
    <div className={styles.webScreen}>
      <small>01 · NHU CẦU HỌC TẬP</small>
      <h4>
        Bạn muốn học
        <br />
        điều gì?
      </h4>
      <p>Chọn mục tiêu gần nhất với bạn.</p>
      {goals.map((goal, index) => (
        <span key={goal} data-selected={index === 0}>
          <i />
          {goal}
        </span>
      ))}
      <div className={styles.webScreenFooter}>
        <span>02 · THÔNG TIN LIÊN HỆ</span>
        <em>Gửi yêu cầu →</em>
      </div>
    </div>
  );
}

/** Glowing "two people connected" mark used on the hero and closing phones. */
export function ConnectOrb() {
  return (
    <div className={styles.orb} aria-hidden="true">
      <span className={styles.orbRing} />
      <span className={`${styles.orbRing} ${styles.orbRingSlow}`} />
      <span className={styles.orbCore}>
        <i />
        <b />
        <i />
      </span>
    </div>
  );
}

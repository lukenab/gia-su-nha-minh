import { sampleRequest } from "@/features/landing/content";

import { Check, Swap, User } from "./icons";
import styles from "./landing.module.css";

/* Decorative scenes for the three journey steps (illustrations only). */

export function RequestScene() {
  return (
    <>
      <span className={styles.sceneLabel}>YÊU CẦU CỦA BẠN</span>
      <div className={styles.requestCard}>
        <div className={styles.requestHead}>
          <span className={styles.roundAvatar}>
            <User />
          </span>
          <div>
            <small>NGƯỜI HỌC</small>
            <b>Muốn cải thiện giao tiếp</b>
          </div>
          <em>Đã gửi</em>
        </div>
        <div className={styles.requestRow}>
          <span>Mục tiêu</span>
          <strong>{sampleRequest.goal}</strong>
        </div>
        <div className={styles.requestRow}>
          <span>Trình độ</span>
          <strong>{sampleRequest.level}</strong>
        </div>
        <div className={styles.requestRow}>
          <span>Thời gian</span>
          <strong>{sampleRequest.availability}</strong>
        </div>
        <div className={styles.requestRow}>
          <span>Hình thức</span>
          <strong>{sampleRequest.format}</strong>
        </div>
      </div>
      <span className={`${styles.flyingChip} ${styles.chipA}`}>Mục tiêu</span>
      <span className={`${styles.flyingChip} ${styles.chipB}`}>Lịch học</span>
      <span className={`${styles.flyingChip} ${styles.chipC}`}>Ngân sách</span>
    </>
  );
}

export function ReviewScene() {
  const tutors = [
    { fit: "Giao tiếp · Buổi tối", active: true },
    { fit: "IELTS · Cuối tuần", active: false },
    { fit: "Nền tảng · Trực tuyến", active: false },
  ];
  return (
    <>
      <span className={styles.sceneLabel}>ĐỐI CHIẾU HỒ SƠ</span>
      <div className={styles.reviewApp}>
        <div className={styles.reviewHeader}>
          <small>TRONG VÒNG 24 GIỜ</small>
          <h4>Tìm gia sư phù hợp</h4>
        </div>
        {tutors.map((tutor) => (
          <div
            className={styles.reviewItem}
            data-active={tutor.active}
            key={tutor.fit}
          >
            <span>
              <User />
            </span>
            <div>
              <strong>Gia sư tiếng Anh</strong>
              <small>{tutor.fit}</small>
            </div>
            <em>
              <Check /> Hồ sơ đã kiểm tra
            </em>
          </div>
        ))}
      </div>
      <span className={styles.scanLine} />
    </>
  );
}

export function ConnectScene() {
  return (
    <>
      <span className={styles.sceneLabel}>TRAO ĐỔI HAI BÊN</span>
      <div className={`${styles.connectCard} ${styles.connectLearner}`}>
        <span className={styles.connectAvatar}>
          <User />
        </span>
        <small>NGƯỜI HỌC</small>
        <b>Cần luyện giao tiếp</b>
        <span>Buổi tối · Cơ bản</span>
      </div>
      <div className={styles.connectPulse}>
        <Swap />
      </div>
      <div className={`${styles.connectCard} ${styles.connectTutor}`}>
        <span className={styles.connectAvatar}>
          <User />
        </span>
        <small>GIA SƯ</small>
        <b>Thế mạnh phù hợp</b>
        <span>Hồ sơ đã kiểm tra</span>
      </div>
      <p className={styles.connectNote}>Hai bên trao đổi và tự quyết định.</p>
    </>
  );
}

export const journeyScenes = [RequestScene, ReviewScene, ConnectScene];

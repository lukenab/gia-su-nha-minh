"use client";

import styles from "@/features/admin/components/admin.module.css";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className={styles.card} role="alert">
      <div className={styles.empty}>
        <h3>Không thể hiển thị trang này</h3>
        <p>
          Đã có lỗi khi tải dữ liệu. Thông tin của bạn không bị mất. Hãy thử
          lại, hoặc quay lại sau nếu lỗi vẫn tiếp tục.
        </p>
        <div className={styles.emptyActions}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={reset}
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}

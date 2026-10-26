import styles from "@/components/admin/admin.module.css";

export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Đang tải dữ liệu">
      <p className={styles.loadingLabel}>Đang tải dữ liệu...</p>
      <div
        className={styles.skeleton}
        style={{ height: 36, width: "min(360px, 60%)", marginBottom: 14 }}
      />
      <div
        className={styles.skeleton}
        style={{ height: 18, width: "min(620px, 85%)", marginBottom: 28 }}
      />
      <div className={styles.statGrid}>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className={styles.skeleton} style={{ height: 112 }} />
        ))}
      </div>
      <div className={styles.skeleton} style={{ height: 280 }} />
    </div>
  );
}

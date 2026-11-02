import type { Metadata } from "next";

import { SiteShell } from "@/features/landing/components/site-shell";
import { TutorApplicationForm } from "@/features/tutor-applications/components/tutor-application-form";
import { site } from "@/shared/config/site";
import { FormAside } from "@/shared/forms/form-aside";
import styles from "@/shared/forms/form.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Trở thành gia sư tiếng Anh | Gia Sư Nhà Mình",
  description:
    "Đăng ký làm gia sư tiếng Anh tại Cần Thơ cùng Gia Sư Nhà Mình và nhận người học phù hợp với thế mạnh chuyên môn.",
  alternates: { canonical: "/become-a-tutor" },
};

export default function BecomeATutorPage() {
  return (
    <SiteShell mainClassName={styles.page}>
      <div className={styles.layout}>
        <FormAside
          eyebrow="Dành cho gia sư"
          title="Dạy đúng"
          highlight="thế mạnh chuyên môn."
          text="Anh/Chị chia sẻ học vấn, kinh nghiệm và lịch dạy. Gia Sư Nhà Mình giới thiệu người học có nhu cầu phù hợp với thế mạnh của Anh/Chị."
          points={[
            {
              title: "Người học đúng nhu cầu",
              text: "Mỗi lời giới thiệu dựa trên nội dung, trình độ, lịch học và hình thức học.",
            },
            {
              title: "Hồ sơ minh bạch",
              text: "Đội ngũ kiểm tra danh tính, chứng chỉ và kinh nghiệm để người học yên tâm.",
            },
            {
              title: "Phản hồi trong 24 giờ",
              text: "Đội ngũ liên hệ để trao đổi và hướng dẫn Anh/Chị các bước tiếp theo.",
            },
          ]}
        />
        <TutorApplicationForm />
      </div>
    </SiteShell>
  );
}

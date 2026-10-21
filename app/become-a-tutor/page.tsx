import type { Metadata } from "next";

import { FormAside } from "@/components/forms/form-aside";
import styles from "@/components/forms/form.module.css";
import { TutorApplicationForm } from "@/components/forms/tutor-application-form";
import { site } from "@/components/landing/site";
import { SiteShell } from "@/components/landing/site-shell";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Trở thành gia sư tiếng Anh | Gia Sư Nhà Mình",
  description:
    "Đăng ký làm gia sư tiếng Anh tại Cần Thơ cùng Gia Sư Nhà Mình và nhận người học phù hợp với thế mạnh của bạn.",
  alternates: { canonical: "/become-a-tutor" },
};

export default function BecomeATutorPage() {
  return (
    <SiteShell mainClassName={styles.page}>
      <div className={styles.layout}>
        <FormAside
          eyebrow="Dành cho gia sư"
          title="Dạy đúng"
          highlight="thế mạnh của bạn."
          text="Chia sẻ chuyên môn, kinh nghiệm và lịch dạy. Gia Sư Nhà Mình giới thiệu người học có nhu cầu phù hợp với bạn."
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
              text: "Chúng tôi liên hệ để trao đổi và hướng dẫn các bước tiếp theo.",
            },
          ]}
        />
        <TutorApplicationForm />
      </div>
    </SiteShell>
  );
}

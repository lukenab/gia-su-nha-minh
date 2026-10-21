import type { Metadata } from "next";

import { FormAside } from "@/components/forms/form-aside";
import styles from "@/components/forms/form.module.css";
import { LearnerRequestForm } from "@/components/forms/learner-request-form";
import { site } from "@/components/landing/site";
import { SiteShell } from "@/components/landing/site-shell";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Tìm gia sư tiếng Anh | Gia Sư Nhà Mình",
  description:
    "Gửi yêu cầu tìm gia sư tiếng Anh 1 kèm 1 tại Cần Thơ trong khoảng 3 phút. Đội ngũ phản hồi trong 24 giờ.",
  alternates: { canonical: "/get-started" },
};

export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { goal } = await searchParams;

  return (
    <SiteShell mainClassName={styles.page}>
      <div className={styles.layout}>
        <FormAside
          eyebrow="Tìm gia sư tiếng Anh"
          title="Bắt đầu từ"
          highlight="mục tiêu của bạn."
          text="Trả lời vài câu hỏi ngắn về mục tiêu, lịch học và ngân sách. Không cần tạo tài khoản."
          points={[
            {
              title: "Phản hồi trong 24 giờ",
              text: "Đội ngũ liên hệ để xác nhận nhu cầu qua kênh bạn chọn.",
            },
            {
              title: "Gia sư được kiểm tra hồ sơ",
              text: "Danh tính, chứng chỉ và kinh nghiệm được đối chiếu trước khi giới thiệu.",
            },
            {
              title: "Bạn là người quyết định",
              text: "Trao đổi với gia sư về cách học, lịch học và học phí trước khi bắt đầu.",
            },
          ]}
        />
        <LearnerRequestForm
          initialGoal={typeof goal === "string" ? goal : undefined}
        />
      </div>
    </SiteShell>
  );
}

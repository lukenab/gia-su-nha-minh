import type { Metadata } from "next";

import { SiteShell } from "@/features/landing/components/site-shell";
import { LearnerRequestForm } from "@/features/learner-requests/components/learner-request-form";
import { site } from "@/shared/config/site";
import { FormAside } from "@/shared/forms/form-aside";
import styles from "@/shared/forms/form.module.css";

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
          title="Bắt đầu từ"
          highlight="mục tiêu của bạn."
          text="Chia sẻ mục tiêu, lịch học và ngân sách dự kiến. Đội ngũ Gia Sư Nhà Mình sẽ xem xét yêu cầu và liên hệ để hỗ trợ bạn tìm gia sư phù hợp."
          points={[
            {
              title: "Liên hệ trong 24 giờ",
              text: "Đội ngũ xác nhận nhu cầu qua kênh liên hệ bạn chọn.",
            },
            {
              title: "Hồ sơ được xem xét",
              text: "Nhà Mình xem xét thông tin và tài liệu do gia sư cung cấp trước khi giới thiệu.",
            },
            {
              title: "Bạn chủ động lựa chọn",
              text: "Trao đổi về cách học, lịch học và học phí trước khi quyết định bắt đầu.",
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

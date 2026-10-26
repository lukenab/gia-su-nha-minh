import type { Metadata } from "next";

import { AuthLayout } from "@/components/admin/auth-layout";

import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | Gia Sư Nhà Mình",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      description="Nhập email quản trị để nhận liên kết đặt lại mật khẩu."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

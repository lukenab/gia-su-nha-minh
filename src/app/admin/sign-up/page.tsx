import type { Metadata } from "next";

import { redirect } from "next/navigation";

import {
  AuthAlert,
  AuthLayout,
} from "@/features/admin-auth/components/auth-layout";
import { SignUpForm } from "@/features/admin-auth/components/sign-up-form";
import {
  adminIsConfigured,
  isAdminAuthenticated,
} from "@/features/admin-auth/server/session";

export const metadata: Metadata = {
  title: "Đăng ký quản trị | Gia Sư Nhà Mình",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSignUpPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <AuthLayout
      title="Đăng ký tài khoản"
      description="Chỉ thành viên đã được cấp quyền quản trị mới có thể tạo tài khoản."
    >
      {adminIsConfigured() ? (
        <SignUpForm />
      ) : (
        <AuthAlert tone="info">
          Hệ thống tài khoản quản trị chưa được cấu hình. Vui lòng liên hệ người
          quản lý hệ thống.
        </AuthAlert>
      )}
    </AuthLayout>
  );
}

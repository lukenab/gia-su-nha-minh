import type { Metadata } from "next";

import Link from "next/link";

import {
  AuthAlert,
  AuthLayout,
} from "@/features/admin-auth/components/auth-layout";
import styles from "@/features/admin-auth/components/auth.module.css";
import { ResetPasswordForm } from "@/features/admin-auth/components/reset-form";
import { inspectResetToken } from "@/features/admin-auth/server/auth";

export const metadata: Metadata = {
  title: "Đặt mật khẩu | Gia Sư Nhà Mình",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  let state: Awaited<ReturnType<typeof inspectResetToken>> | "error" = null;
  try {
    state = await inspectResetToken(token);
  } catch {
    state = "error";
  }

  if (!state || state === "error") {
    return (
      <AuthLayout title="Liên kết không còn hiệu lực">
        <AuthAlert tone={state === "error" ? "error" : "info"}>
          {state === "error"
            ? "Chưa thể kiểm tra liên kết lúc này. Vui lòng thử lại sau."
            : "Liên kết đặt mật khẩu đã hết hạn hoặc đã được sử dụng. Hãy yêu cầu liên kết mới."}
        </AuthAlert>
        <Link
          className={`${styles.button} ${styles.primary}`}
          href="/admin/forgot-password"
        >
          Yêu cầu liên kết mới
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={state.isFirstPassword ? "Thiết lập mật khẩu" : "Đặt mật khẩu mới"}
      description="Mật khẩu cần ít nhất 10 ký tự. Nên dùng một cụm từ dễ nhớ với bạn nhưng khó đoán với người khác."
    >
      <ResetPasswordForm token={token} needsName={state.needsName} />
    </AuthLayout>
  );
}

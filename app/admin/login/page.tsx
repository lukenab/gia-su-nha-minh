import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthAlert, AuthLayout } from "@/components/admin/auth-layout";
import { AuthNotice } from "@/components/admin/auth-notice";
import styles from "@/components/admin/auth.module.css";
import { GoogleIcon } from "@/components/admin/google-icon";
import { adminIsConfigured, isAdminAuthenticated } from "@/lib/admin-session";
import { safeNextPath } from "@/lib/admin-token";

import { PasswordLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | Gia Sư Nhà Mình",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  not_allowed:
    "Tài khoản Google này chưa được cấp quyền truy cập. Nếu bạn là thành viên đội ngũ, hãy liên hệ trưởng nhóm.",
  google_cancelled: "Bạn đã hủy đăng nhập bằng Google.",
  google_failed: "Không thể đăng nhập bằng Google. Vui lòng thử lại.",
  google_unavailable:
    "Đăng nhập bằng Google hiện chưa khả dụng. Vui lòng dùng email và mật khẩu.",
};
const notices: Record<string, string> = {
  password_set: "Mật khẩu đã được cập nhật. Bạn có thể đăng nhập.",
  signed_out: "Bạn đã đăng xuất.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (await isAdminAuthenticated()) redirect(next);
  const error =
    typeof params.error === "string" ? errors[params.error] : undefined;
  const notice =
    typeof params.status === "string" ? notices[params.status] : undefined;

  return (
    <AuthLayout
      title="Đăng nhập"
      description="Truy cập không gian quản trị Gia Sư Nhà Mình."
      footer={
        <>
          Thành viên mới đã được cấp quyền?{" "}
          <Link className={styles.textLink} href="/admin/sign-up">
            Đăng ký
          </Link>
        </>
      }
    >
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
      {notice && <AuthNotice tone="ok">{notice}</AuthNotice>}

      {!adminIsConfigured() ? (
        <AuthAlert tone="info">
          Hệ thống đăng nhập chưa được cấu hình. Cần đặt ADMIN_SESSION_SECRET và
          ADMIN_ALLOWED_EMAILS trước khi sử dụng.
        </AuthAlert>
      ) : (
        <>
          <PasswordLoginForm next={next} />
          <div className={styles.divider}>Hoặc tiếp tục với</div>
          <form action="/api/admin/auth/google" method="get">
            {next !== "/admin" && (
              <input type="hidden" name="next" value={next} />
            )}
            <button
              type="submit"
              className={`${styles.button} ${styles.outline}`}
            >
              <GoogleIcon />
              Google
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}

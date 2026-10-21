import Link from "next/link";

import { adminIsConfigured } from "@/lib/admin-session";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="login-page">
      <div className="login-card">
        <Link className="brand" href="/">
          <span className="brand-mark">NM</span>
          <span className="brand-name">
            Gia Sư <strong>Nhà Mình</strong>
          </span>
        </Link>
        <div className="login-heading">
          <span className="eyebrow">KHÔNG GIAN QUẢN TRỊ</span>
          <h1>Chào mừng trở lại.</h1>
          <p>Đăng nhập để xem và xử lý yêu cầu tìm gia sư đã gửi đến nhóm.</p>
        </div>
        {adminIsConfigured() ? (
          <LoginForm />
        ) : (
          <div className="setup-warning">
            <strong>Dashboard chưa được cấu hình.</strong>
            <p>
              Hãy đặt ADMIN_PASSWORD và ADMIN_SESSION_SECRET trong tệp
              .env.local theo hướng dẫn README trước khi đăng nhập.
            </p>
          </div>
        )}
        <Link className="login-back" href="/">
          ← Về trang dành cho người học
        </Link>
      </div>
      <div className="login-side">
        <div>
          <span>GIA SƯ NHÀ MÌNH · ADMIN</span>
          <h2>
            Mọi yêu cầu
            <br />
            trong một nơi.
          </h2>
          <p>
            Theo dõi nhu cầu của người học rõ ràng để hỗ trợ kết nối đúng lúc.
          </p>
        </div>
        <div className="login-decoration">
          <span>01</span>
          <strong>Yêu cầu người học</strong>
          <small>Giai đoạn đầu tiên của nền tảng</small>
        </div>
      </div>
    </main>
  );
}

/*
 * Transactional email through Resend's HTTP API (no SDK needed).
 * Requires RESEND_API_KEY and EMAIL_FROM, e.g.
 * EMAIL_FROM="Gia Sư Nhà Mình <no-reply@giasunhaminh.vn>".
 */
export function emailIsConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export async function sendPasswordResetEmail(to: string, link: string, minutes: number) {
  if (!emailIsConfigured()) {
    if (process.env.NODE_ENV === "development") {
      // Local development only: the link is printed instead of emailed.
      console.info(`[admin] Liên kết đặt mật khẩu (chỉ hiện khi chạy local): ${link}`);
      return true;
    }
    console.error("[admin] Email chưa được cấu hình (RESEND_API_KEY, EMAIL_FROM).");
    return false;
  }

  const text = [
    "Xin chào,",
    "",
    "Chúng tôi nhận được yêu cầu đặt mật khẩu cho tài khoản quản trị Gia Sư Nhà Mình.",
    `Mở liên kết sau trong ${minutes} phút để đặt mật khẩu mới:`,
    link,
    "",
    "Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại sẽ không thay đổi.",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#132145;max-width:520px">
<p>Xin chào,</p>
<p>Chúng tôi nhận được yêu cầu đặt mật khẩu cho tài khoản quản trị <strong>Gia Sư Nhà Mình</strong>.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#4361ee;color:#fff;text-decoration:none;font-weight:bold">Đặt mật khẩu</a></p>
<p>Liên kết có hiệu lực trong ${minutes} phút và chỉ dùng được một lần.</p>
<p style="color:#5f6b86">Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại sẽ không thay đổi.</p>
</div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: "Đặt mật khẩu quản trị Gia Sư Nhà Mình",
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.error(`[admin] Gửi email thất bại (HTTP ${response.status}).`);
    return response.ok;
  } catch {
    console.error("[admin] Không kết nối được dịch vụ gửi email.");
    return false;
  }
}

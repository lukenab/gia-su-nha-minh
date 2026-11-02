/*
 * Transactional email through Resend's HTTP API (no SDK needed).
 * Requires RESEND_API_KEY and EMAIL_FROM, e.g.
 * EMAIL_FROM="Gia Sư Nhà Mình <no-reply@giasunhaminh.vn>".
 */
import "server-only";

export function emailIsConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim(),
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export async function sendPasswordResetEmail(
  to: string,
  link: string,
  minutes: number,
) {
  if (!emailIsConfigured()) {
    if (process.env.NODE_ENV === "development") {
      // Local development only: the link is printed instead of emailed.
      console.info(
        `[admin] Password link (shown only when running locally): ${link}`,
      );
      return true;
    }
    console.error(
      "[admin] Email is not configured (RESEND_API_KEY, EMAIL_FROM).",
    );
    return false;
  }

  const text = [
    "Hello,",
    "",
    "We received a request to set the password for your Gia Sư Nhà Mình admin account.",
    `Open this link within ${minutes} minutes to set a new password:`,
    link,
    "",
    "If you did not ask for this, ignore this email. Your current password will not change.",
  ].join("\n");
  const html = `<div lang="en" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#132145;max-width:520px">
<p>Hello,</p>
<p>We received a request to set the password for your <strong>Gia Sư Nhà Mình</strong> admin account.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#4361ee;color:#fff;text-decoration:none;font-weight:bold">Set password</a></p>
<p>The link is valid for ${minutes} minutes and can only be used once.</p>
<p style="color:#5f6b86">If you did not ask for this, ignore this email. Your current password will not change.</p>
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
        subject: "Set your Gia Sư Nhà Mình admin password",
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok)
      console.error(
        `[admin] Sending the email failed (HTTP ${response.status}).`,
      );
    return response.ok;
  } catch {
    console.error("[admin] Could not reach the email service.");
    return false;
  }
}

import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AuthAlert,
  AuthLayout,
} from "@/features/admin-auth/components/auth-layout";
import { AuthNotice } from "@/features/admin-auth/components/auth-notice";
import { PasswordLoginForm } from "@/features/admin-auth/components/login-form";
import {
  adminIsConfigured,
  isAdminAuthenticated,
} from "@/features/admin-auth/server/session";
import { safeNextPath } from "@/features/admin-auth/server/token";

export const metadata: Metadata = {
  title: "Sign in | Nexus Workspace",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  not_allowed:
    "This Google account does not have access. If you are on the team, contact the team lead.",
  google_cancelled: "You cancelled signing in with Google.",
  google_failed: "Could not sign in with Google. Please try again.",
  google_unavailable:
    "Signing in with Google is not available. Use your email and password.",
};
const notices: Record<string, string> = {
  password_set: "Your password was updated. You can sign in now.",
  signed_out: "You have signed out.",
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
      title="Welcome back"
      description="Sign in to your Nexus Workspace."
      footer={<Link href="/">Back to home page</Link>}
    >
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
      {notice && <AuthNotice tone="ok">{notice}</AuthNotice>}

      {!adminIsConfigured() ? (
        <AuthAlert tone="info">
          Sign-in is not configured. Set ADMIN_SESSION_SECRET and
          ADMIN_ALLOWED_EMAILS before using it.
        </AuthAlert>
      ) : (
        <>
          <PasswordLoginForm next={next} />
        </>
      )}
    </AuthLayout>
  );
}

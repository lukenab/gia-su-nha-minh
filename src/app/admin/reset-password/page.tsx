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
  title: "Set password | Nexus Workspace",
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
      <AuthLayout title="This link is no longer valid">
        <AuthAlert tone={state === "error" ? "error" : "info"}>
          {state === "error"
            ? "Could not check the link right now. Please try again later."
            : "This password link has expired or was already used. Request a new link."}
        </AuthAlert>
        <Link
          className={`${styles.button} ${styles.primary}`}
          href="/admin/forgot-password"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={
        state.isFirstPassword ? "Set up your password" : "Set a new password"
      }
      description="Use at least 10 characters. A phrase that is easy for you to remember but hard for others to guess works well."
    >
      <ResetPasswordForm token={token} needsName={state.needsName} />
    </AuthLayout>
  );
}

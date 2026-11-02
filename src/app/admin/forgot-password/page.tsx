import type { Metadata } from "next";

import { AuthLayout } from "@/features/admin-auth/components/auth-layout";
import { ForgotPasswordForm } from "@/features/admin-auth/components/forgot-form";

export const metadata: Metadata = {
  title: "Reset password | Nexus Workspace",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset password"
      description="Enter your workspace email and we’ll send you a reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

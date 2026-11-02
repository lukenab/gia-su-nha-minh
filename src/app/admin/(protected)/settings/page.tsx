import { getAccount } from "@/features/admin-auth/server/account";
import { requireAdminSession } from "@/features/admin-auth/server/guard";
import {
  AppearanceForm,
  PasswordForm,
} from "@/features/admin/components/account-forms";
import {
  Card,
  ErrorNotice,
  PageHeader,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import { formatDateTime } from "@/shared/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const identity = await requireAdminSession();
  let account: Awaited<ReturnType<typeof getAccount>> | null = null;
  try {
    account = await getAccount(identity);
  } catch {
    account = null;
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Account settings"
        description="Your password and how the admin looks on this device."
      />
      <div className={styles.detailLayout}>
        <div className={styles.stack}>
          <Card
            title="Password"
            description={
              account?.passwordUpdatedAt
                ? `Last changed ${formatDateTime(account.passwordUpdatedAt)}.`
                : undefined
            }
          >
            {account ? (
              <PasswordForm email={account.email} />
            ) : (
              <ErrorNotice>
                Could not load your account from MongoDB. Please try again
                later.
              </ErrorNotice>
            )}
            <p className={styles.mutedText} style={{ marginTop: 14 }}>
              Changing the password does not sign out other devices; their
              sessions end within 8 hours.
            </p>
          </Card>
        </div>
        <div className={styles.stack}>
          <Card title="Appearance" description="Saved in this browser only.">
            <AppearanceForm />
          </Card>
        </div>
      </div>
    </>
  );
}

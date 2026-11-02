import { getAccount } from "@/features/admin-auth/server/account";
import { requireAdminSession } from "@/features/admin-auth/server/guard";
import { DisplayNameForm } from "@/features/admin/components/account-forms";
import {
  Card,
  DefList,
  ErrorNotice,
  PageHeader,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import { formatDateTime } from "@/shared/lib/format";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
        title="Profile"
        description="How you appear to the rest of the team."
      />
      {!account ? (
        <ErrorNotice>
          Could not load your account from MongoDB. Please try again later.
        </ErrorNotice>
      ) : (
        <div className={styles.detailLayout}>
          <div className={styles.stack}>
            <Card title="Display name">
              <DisplayNameForm initial={account.name} />
            </Card>
          </div>
          <div className={styles.stack}>
            <Card title="Account details">
              <DefList
                items={[
                  { label: "Email", value: account.email },
                  { label: "Sign-in method", value: account.method },
                  {
                    label: "Account created",
                    value: formatDateTime(account.createdAt),
                  },
                  {
                    label: "Last sign-in",
                    value: formatDateTime(account.lastLoginAt),
                  },
                ]}
              />
              <p className={styles.mutedText} style={{ marginTop: 14 }}>
                Access is granted by the team lead through ADMIN_ALLOWED_EMAILS.
                Ask them to change the email for this account.
              </p>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

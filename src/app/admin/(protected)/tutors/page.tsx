import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { ExportButton } from "@/features/admin/components/export-button";
import {
  ListPager,
  ListToolbar,
} from "@/features/admin/components/list-controls";
import {
  Ago,
  ListEmpty,
  ListFrame,
  ListTabs,
  PrimaryCell,
  TwoLine,
  listStyles as list,
  renderTime,
} from "@/features/admin/components/list-view";
import {
  ErrorNotice,
  PageHeader,
  TutorStatus,
  hrefWith,
} from "@/features/admin/components/ui";
import {
  experienceLabels,
  labelOf,
  teachingAreaLabels,
  tutorFormatLabels,
} from "@/features/admin/labels";
import { countTutorTabs, listTutors } from "@/features/admin/server/queries";
import {
  PAGE_SIZE,
  PAGE_SIZES,
  TUTOR_STAGES,
  parseTutorListParams,
  type TutorStage,
} from "@/features/admin/validation";
import { statusLabels, tutorStatuses } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const PATH = "/admin/tutors";
const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

const STAGE_TABS: { key: TutorStage; label: string }[] = [
  { key: "review", label: "To review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdminPage();
  const params = parseTutorListParams(await searchParams);
  let data: {
    result: Awaited<ReturnType<typeof listTutors>>;
    counts: Record<string, number>;
  } | null = null;
  try {
    const [result, counts] = await Promise.all([
      listTutors(actor, params),
      countTutorTabs(actor, params),
    ]);
    data = { result, counts };
  } catch {
    data = null;
  }

  const kept = {
    q: params.q,
    accepting: params.accepting,
    area: params.area,
    format: params.format,
    size: params.size === PAGE_SIZE ? undefined : params.size,
  };
  const activeStage =
    params.stage ??
    STAGE_TABS.find((tab) =>
      (TUTOR_STAGES[tab.key] as readonly string[]).includes(
        params.status ?? "",
      ),
    )?.key;
  const filtered = Boolean(
    params.q ||
    params.accepting ||
    params.area ||
    params.format ||
    params.status,
  );
  const now = renderTime();
  const stageCount = (stage: TutorStage) =>
    TUTOR_STAGES[stage].reduce(
      (sum, status) => sum + (data?.counts[status] ?? 0),
      0,
    );

  return (
    <>
      <PageHeader
        eyebrow="Intake"
        title="Tutor profiles"
        description="Tutors fill in these profiles themselves. Only profiles the team has reviewed and approved can be introduced."
        actions={<ExportButton kind="tutors" />}
      />
      {!data ? (
        <ErrorNotice>
          Could not load profiles from MongoDB. Check the connection and reload
          the page.
        </ErrorNotice>
      ) : (
        <>
          <ListTabs
            label="Profile stage"
            tabs={[
              {
                key: "all",
                label: "All",
                count: data.counts.all ?? 0,
                href: hrefWith(PATH, kept),
                active: !activeStage,
              },
              ...STAGE_TABS.map((tab) => ({
                key: tab.key,
                label: tab.label,
                count: stageCount(tab.key),
                href: hrefWith(PATH, kept, { stage: tab.key }),
                active: activeStage === tab.key,
              })),
            ]}
          />
          <ListFrame
            toolbar={
              <ListToolbar
                searchLabel="Search by code or name"
                placeholder="Search code or name"
                clearKeys={["q", "status", "accepting", "area", "format"]}
                selects={[
                  {
                    name: "status",
                    label: "Status",
                    allLabel: "Any status",
                    options: tutorStatuses.map((value) => ({
                      value,
                      label: statusLabels.tutor[value],
                    })),
                  },
                  {
                    name: "accepting",
                    label: "Taking learners",
                    allLabel: "Any availability",
                    options: [
                      { value: "yes", label: "Taking learners" },
                      { value: "no", label: "Paused or not confirmed" },
                    ],
                  },
                  {
                    name: "area",
                    label: "Teaching content",
                    allLabel: "Any content",
                    options: toOptions(teachingAreaLabels),
                  },
                  {
                    name: "format",
                    label: "Format",
                    allLabel: "Any format",
                    options: toOptions(tutorFormatLabels),
                  },
                ]}
              />
            }
            footer={
              <ListPager
                first={data.result.first}
                last={data.result.last}
                total={data.result.total}
                page={data.result.page}
                pages={data.result.pages}
                size={params.size}
                sizes={PAGE_SIZES}
                noun={["profile", "profiles"]}
              />
            }
          >
            {data.result.items.length ? (
              <table className={list.table}>
                <thead>
                  <tr>
                    <th scope="col">Tutor</th>
                    <th scope="col">Teaches</th>
                    <th scope="col">Status</th>
                    <th scope="col" className={list.end}>
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.result.items.map((item) => {
                    const areas = item.teachingAreas.map((area) =>
                      labelOf(teachingAreaLabels, area),
                    );
                    const reviewed = Object.values(item.reviews ?? {}).filter(
                      (step) => step?.reviewed,
                    ).length;
                    return (
                      <tr key={String(item._id)}>
                        <td>
                          <PrimaryCell
                            href={`${PATH}/${String(item._id)}`}
                            title={item.fullName}
                            subtitle={item.referenceCode}
                          />
                        </td>
                        <td>
                          <TwoLine
                            main={
                              areas.length > 2
                                ? `${areas.slice(0, 2).join(", ")} +${areas.length - 2}`
                                : areas.join(", ")
                            }
                            sub={`${labelOf(tutorFormatLabels, item.format)} · ${labelOf(experienceLabels, item.experience)}`}
                          />
                        </td>
                        <td>
                          <TutorStatus
                            status={item.status}
                            accepting={item.acceptingStudents}
                            reviewed={reviewed}
                          />
                        </td>
                        <td className={list.end}>
                          <Ago value={item.createdAt} now={now} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <ListEmpty
                title={
                  filtered || activeStage
                    ? "No matching profiles"
                    : "No tutor profiles yet"
                }
              >
                {filtered || activeStage
                  ? "Try another search term, tab or filter."
                  : "Profiles sent from the tutor sign-up page will appear here."}
              </ListEmpty>
            )}
          </ListFrame>
        </>
      )}
    </>
  );
}

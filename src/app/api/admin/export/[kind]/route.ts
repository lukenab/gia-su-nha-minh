import { requireAdminApi } from "@/features/admin-auth/server/guard";
import { toCsv } from "@/features/admin/csv";
import {
  listConnections,
  listRequests,
  listTutors,
} from "@/features/admin/server/queries";
import {
  parseConnectionListParams,
  parseRequestListParams,
  parseTutorListParams,
} from "@/features/admin/validation";
import { statusLabel, statusLabelsVi } from "@/shared/lib/workflow";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("response" in auth) return auth.response;
  const { kind } = await context.params;
  const params = Object.fromEntries(new URL(request.url).searchParams);
  params.page = "1";
  let rows: unknown[][];
  let total: number;
  try {
    if (kind === "requests") {
      const data = await listRequests(
        auth.actor,
        parseRequestListParams(params),
        10000,
      );
      total = data.total;
      rows = [
        [
          "Mã yêu cầu",
          "Người học",
          "Email",
          "Điện thoại",
          "Mục tiêu",
          "Trình độ",
          "Hình thức",
          "Ngân sách",
          "Người phụ trách",
          "Trạng thái",
          "Ngày gửi",
        ],
        ...data.items.map((x) => [
          x.referenceCode,
          x.fullName,
          x.email,
          x.phone,
          x.goal,
          x.currentLevel,
          x.format,
          x.budgetMax,
          x.assignedTo,
          statusLabel("learner", x.status, statusLabelsVi),
          new Date(x.createdAt).toISOString(),
        ]),
      ];
    } else if (kind === "tutors") {
      const data = await listTutors(
        auth.actor,
        parseTutorListParams(params),
        10000,
      );
      total = data.total;
      rows = [
        [
          "Mã hồ sơ",
          "Gia sư",
          "Email",
          "Điện thoại",
          "Nội dung dạy",
          "Trình độ",
          "Hình thức",
          "Học phí",
          "Nhận học viên",
          "Trạng thái",
        ],
        ...data.items.map((x) => [
          x.referenceCode,
          x.fullName,
          x.email,
          x.phone,
          x.teachingAreas.join("; "),
          x.learnerLevels.join("; "),
          x.format,
          x.expectedFee,
          x.acceptingStudents === true ? "Có" : "Chưa nhận/chưa xác nhận",
          statusLabel("tutor", x.status, statusLabelsVi),
        ]),
      ];
    } else if (kind === "connections") {
      const data = await listConnections(
        auth.actor,
        parseConnectionListParams(params),
        10000,
      );
      total = data.total;
      rows = [
        [
          "Yêu cầu",
          "Người học",
          "Gia sư",
          "Tên gia sư",
          "Trạng thái",
          "Xác nhận hai bên",
          "Phí",
          "Thanh toán",
          "Ngày thu",
          "Phương thức",
          "Mã giao dịch",
        ],
        ...data.items.map((x) => [
          x.requestCode,
          x.learnerName,
          x.tutorCode,
          x.tutorName,
          statusLabel("connection", x.status, statusLabelsVi),
          x.confirmedAt ? new Date(x.confirmedAt).toISOString() : "",
          x.confirmedAt ? x.feeAmount : "",
          x.paymentStatus || "NOT_DUE",
          x.paidAt ? new Date(x.paidAt).toISOString() : "",
          x.paymentMethod,
          x.paymentReference,
        ]),
      ];
    } else
      return Response.json({ error: "Export not found." }, { status: 404 });
    if (total > 10000)
      return Response.json(
        {
          error:
            "There are more than 10,000 records. Narrow the filters before exporting.",
        },
        { status: 413 },
      );
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="giasunhaminh-${kind}.csv"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Could not export the data. Please try again." },
      { status: 503 },
    );
  }
}

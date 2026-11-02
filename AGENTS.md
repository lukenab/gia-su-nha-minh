# Gia Sư Nhà Mình

Website của dịch vụ kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh 1 kèm 1 theo mục tiêu, lịch học và ngân sách. Đội ngũ tiếp nhận và xử lý yêu cầu theo mô hình concierge, phản hồi trong 24 giờ. Ứng dụng Next.js (App Router) lưu yêu cầu người học vào MongoDB và có trang quản trị riêng.

## Commands

- `npm install` — cài dependency.
- `npm run dev` — chạy tại `http://localhost:3000`.
- `npm run lint` / `npm run fmt:check` — oxlint và oxfmt.
- `npm test` — test validation, form, nội dung landing, luồng trạng thái, bộ lọc, phiên và quyền truy cập admin.
- `npm run test:db`, `npm run test:e2e` — test với MongoDB tạm (cần tải MongoDB binary).
- `npm run build` — production build.
- `npm run admin:migrate-en` — chuyển chữ cố định tiếng Việt trong lịch sử admin cũ sang tiếng Anh (mặc định chạy thử; thêm `-- --apply` để ghi).

## Structure

Mã ứng dụng nằm trong `src/` (alias `@/*` → `src/*`); `public/`, `tests/`, `scripts/` và các file cấu hình ở thư mục gốc.

- `src/app/` — chỉ chứa route, layout, loading/error, route handler; logic nằm trong `src/features/`.
  - `page.tsx` — trang chủ; `get-started/` (biểu mẫu người học, API `api/requests/`); `become-a-tutor/` (biểu mẫu gia sư, API `api/tutor-applications/`); `privacy/`, `terms/`.
  - `admin/` — khu vực quản trị (tổng quan, yêu cầu học, hồ sơ gia sư, kết nối) và trang đăng nhập/đăng ký/quên mật khẩu; API ghi dữ liệu ở `api/admin/`. Không có liên kết công khai; chỉ người đã đăng nhập mới thấy nút "Vào quản trị". `/login`, `/signin`, `/dashboard` chuyển về admin; chưa đăng nhập thì `src/proxy.ts` giúp quay lại đúng trang qua `?next=`.
- `src/features/` — mã theo tính năng. Thư mục `server/` chỉ chạy trên server (có `import "server-only"`); client component không được import từ đó.
  - `landing/` — `components/`, `styles/` (CSS Module chia theo khu vực, `_shared` giữ phần dùng chung giữa các khu vực), `hooks/`, `content.ts` (toàn bộ nội dung công khai), `fonts.ts`, `brand/`.
  - `learner-requests/`, `tutor-applications/` — biểu mẫu nhiều bước: `components/` (+ `steps/`), `form-model.ts` (state, bước), `form-validation.ts`, `submit.ts`, `validation.ts` (zod, dùng cho API), `server/model.ts`.
  - `admin-auth/` — đăng nhập bằng email + mật khẩu, phiên, mật khẩu, email đặt lại; `server/guard.ts` cấp `AdminActor`.
  - `admin/` — giao diện quản trị bằng tiếng Anh, font Inter tự host (`fonts.ts`), icon `lucide-react`; nhãn tiếng Anh cho các lựa chọn của biểu mẫu ở `labels.ts` (biểu mẫu công khai và file CSV vẫn dùng tiếng Việt). `components/`, `styles/`, `server/queries.ts` (đọc, phân trang), `server/service.ts` (ghi), `server/api.ts`, `matching.ts` (bộ lọc gia sư hỗ trợ, không chấm điểm), `validation.ts`, `types.ts`.
- `src/shared/` — chỉ những thứ dùng chung thật sự: `forms/` (khung wizard, trường nhập), `lib/` (`workflow.ts` trạng thái và mốc 24 giờ, `options.ts` theo phiếu khảo sát Chương 2, `format.ts`), `config/site.ts` (tên miền, Facebook, mô tả), `server/` (MongoDB, helper API).
- `tests/` — node:test (chạy với `--conditions=react-server` để import được module `server-only`).

## Rules

- Không công bố số liệu, testimonial hoặc hồ sơ gia sư chưa được kiểm chứng.
- Không sử dụng hồ sơ giả hoặc ngôn ngữ khiến người dùng hiểu nhầm rằng việc so khớp được tự động hóa.
- Các tuyên bố công khai phải nhất quán với những gì nhóm đã xác nhận: phản hồi trong 24 giờ và kiểm tra danh tính, chứng chỉ, kinh nghiệm của gia sư. Phí đã chốt: người học trả 50.000 đồng một lần sau khi cả hai bên xác nhận sẽ học; không thu của gia sư.
- Chỉ hiển thị kênh liên hệ đã được xác nhận; Facebook chính thức là `https://facebook.com/giasunhaminh`.
- Không đưa đường dẫn, ảnh chụp hoặc mô tả trang quản trị lên trang công khai.
- Admin: yêu cầu chỉ được tính là đã liên hệ khi đội ngũ ghi nhận `CONTACTED` (`contactedAt`); việc form được lưu không phải là liên hệ. Hồ sơ gia sư chỉ `ELIGIBLE` sau khi ghi nhận riêng danh tính, chứng chỉ, kinh nghiệm. Tạo kết nối không tự gửi tin hay tiết lộ thông tin liên hệ, và không tự đổi trạng thái yêu cầu.
- Mọi API và trang admin phải kiểm tra phiên ở phía server (`requireAdminPage`, `requireAdminApi`), không chỉ ẩn nút. Lớp dữ liệu admin (`queries.ts`, `service.ts`) nhận `AdminActor` do các guard cấp và từ chối chạy nếu thiếu; chỉ truyền cho Client Component những giá trị đơn giản cần hiển thị, không truyền document Mongoose.
- Đăng nhập admin: chỉ email + mật khẩu (scrypt), tài khoản được cấp bằng `scripts/create-admin.mjs`. Chỉ email trong `ADMIN_ALLOWED_EMAILS` được vào; kiểm tra lại mỗi request. Google và mật khẩu dùng chung bị vô hiệu hóa trong MVP. Không tự tạo tài khoản thật hoặc đặt lại mật khẩu nếu chưa được yêu cầu.
- Kết nối: ghi nhận riêng xác nhận người học và gia sư; `CONFIRMED` khác `STARTED`. Phí chỉ đến hạn khi đủ hai xác nhận; chỉ `PAID` được tính doanh thu. Ghi nhận/hủy thu phí có lịch sử, chống lưu trùng bằng revision. Tạo kết nối mới chỉ dùng gia sư `ELIGIBLE` và `acceptingStudents=true`.
- Giữ khả năng sử dụng bằng bàn phím, focus state, label, `prefers-reduced-motion` và dialog semantics khi chỉnh UI.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gia Sư Nhà Mình

Website của dịch vụ kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh 1 kèm 1 theo mục tiêu, lịch học và ngân sách. Đội ngũ tiếp nhận và xử lý yêu cầu theo mô hình concierge, phản hồi trong 24 giờ. Ứng dụng Next.js (App Router) lưu yêu cầu người học vào MongoDB và có trang quản trị riêng.

## Commands

- `npm install` — cài dependency.
- `npm run dev` — chạy tại `http://localhost:3000`.
- `npm run lint` / `npm run fmt:check` — oxlint và oxfmt.
- `npm test` — test validation, nội dung landing, luồng trạng thái, bộ lọc và phiên quản trị.
- `npm run test:db`, `npm run test:e2e` — test với MongoDB tạm (cần tải MongoDB binary).
- `npm run build` — production build.

## Structure

- `app/page.tsx` — trang chủ; nội dung nằm trong `components/landing/`.
- `components/landing/content.ts` — toàn bộ nội dung công khai của landing; `site.ts` — tên miền, Facebook, mô tả.
- `app/get-started/` — biểu mẫu người học nhiều bước (API: `app/api/requests/`).
- `app/become-a-tutor/` — biểu mẫu đăng ký gia sư (API: `app/api/tutor-applications/`).
- `components/forms/` — khung biểu mẫu nhiều bước và các trường dùng chung.
- `app/admin/` — khu vực quản trị có mật khẩu (tổng quan, yêu cầu học, hồ sơ gia sư, kết nối); không có liên kết công khai; chỉ người đã đăng nhập mới thấy nút "Vào quản trị" (`components/landing/admin-shortcut.tsx`). `/login`, `/signin`, `/dashboard` chuyển về admin; chưa đăng nhập thì `proxy.ts` giúp quay lại đúng trang qua `?next=`. Giao diện: `components/admin/`; API ghi dữ liệu: `app/api/admin/`.
- `lib/workflow.ts` — trạng thái, luồng chuyển trạng thái và mốc phản hồi 24 giờ; `lib/admin-service.ts` (ghi), `lib/admin-queries.ts` (đọc, phân trang), `lib/matching.ts` (bộ lọc gia sư hỗ trợ, không chấm điểm).
- `app/privacy/`, `app/terms/` — trang pháp lý.
- `lib/` — kết nối MongoDB, model, validation, danh sách lựa chọn (`options.ts`, theo phiếu khảo sát Chương 2), phiên quản trị.
- `tests/` — node:test.

## Rules

- Không công bố số liệu, testimonial hoặc hồ sơ gia sư chưa được kiểm chứng.
- Không sử dụng hồ sơ giả hoặc ngôn ngữ khiến người dùng hiểu nhầm rằng việc so khớp được tự động hóa.
- Các tuyên bố công khai phải nhất quán với những gì nhóm đã xác nhận: phản hồi trong 24 giờ và kiểm tra danh tính, chứng chỉ, kinh nghiệm của gia sư. Không công bố thông tin về phí kết nối khi nhóm chưa xác nhận.
- Chỉ hiển thị kênh liên hệ đã được xác nhận; Facebook chính thức là `https://facebook.com/giasunhaminh`.
- Không đưa đường dẫn, ảnh chụp hoặc mô tả trang quản trị lên trang công khai.
- Admin: yêu cầu chỉ được tính là đã liên hệ khi đội ngũ ghi nhận `CONTACTED` (`contactedAt`); việc form được lưu không phải là liên hệ. Hồ sơ gia sư chỉ `ELIGIBLE` sau khi ghi nhận riêng danh tính, chứng chỉ, kinh nghiệm. Tạo kết nối không tự gửi tin hay tiết lộ thông tin liên hệ, và không tự đổi trạng thái yêu cầu.
- Mọi API và trang admin phải kiểm tra phiên ở phía server (`requireAdminPage`, `requireAdminApi`), không chỉ ẩn nút.
- Đăng nhập admin: Google (`/api/admin/auth/google`) hoặc email + mật khẩu (`admin_users`, scrypt). Chỉ email trong `ADMIN_ALLOWED_EMAILS` được vào; danh sách được kiểm tra lại ở mỗi request. Mật khẩu đặt/đặt lại qua liên kết email một lần (Resend). `ADMIN_PASSWORD` chỉ dùng khi `next dev`. Xem `.env.example`.
- Giữ khả năng sử dụng bằng bàn phím, focus state, label, `prefers-reduced-motion` và dialog semantics khi chỉnh UI.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

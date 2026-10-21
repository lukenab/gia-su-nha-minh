# Gia Sư Nhà Mình

Website của dịch vụ kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh 1 kèm 1 theo mục tiêu, lịch học và ngân sách. Đội ngũ tiếp nhận và xử lý yêu cầu theo mô hình concierge, phản hồi trong 24 giờ. Ứng dụng Next.js (App Router) lưu yêu cầu người học vào MongoDB và có trang quản trị riêng.

## Commands

- `npm install` — cài dependency.
- `npm run dev` — chạy tại `http://localhost:3000`.
- `npm run lint` / `npm run fmt:check` — oxlint và oxfmt.
- `npm test` — test validation và nội dung landing.
- `npm run test:db`, `npm run test:e2e` — test với MongoDB tạm (cần tải MongoDB binary).
- `npm run build` — production build.

## Structure

- `app/page.tsx` — trang chủ; nội dung nằm trong `components/landing/`.
- `components/landing/content.ts` — toàn bộ nội dung công khai của landing; `site.ts` — tên miền, Facebook, mô tả.
- `app/get-started/` — biểu mẫu người học nhiều bước (API: `app/api/requests/`).
- `app/become-a-tutor/` — biểu mẫu đăng ký gia sư (API: `app/api/tutor-applications/`).
- `components/forms/` — khung biểu mẫu nhiều bước và các trường dùng chung.
- `app/admin/` — trang quản trị có mật khẩu; không liên kết từ trang công khai.
- `app/privacy/`, `app/terms/` — trang pháp lý.
- `lib/` — kết nối MongoDB, model, validation, danh sách lựa chọn (`options.ts`, theo phiếu khảo sát Chương 2), phiên quản trị.
- `tests/` — node:test.

## Rules

- Không công bố số liệu, testimonial hoặc hồ sơ gia sư chưa được kiểm chứng.
- Không sử dụng hồ sơ giả hoặc ngôn ngữ khiến người dùng hiểu nhầm rằng việc so khớp được tự động hóa.
- Các tuyên bố công khai phải nhất quán với những gì nhóm đã xác nhận: phản hồi trong 24 giờ và kiểm tra danh tính, chứng chỉ, kinh nghiệm của gia sư. Không công bố thông tin về phí kết nối khi nhóm chưa xác nhận.
- Chỉ hiển thị kênh liên hệ đã được xác nhận; Facebook chính thức là `https://facebook.com/giasunhaminh`.
- Không đưa đường dẫn, ảnh chụp hoặc mô tả trang quản trị lên trang công khai.
- Giữ khả năng sử dụng bằng bàn phím, focus state, label, `prefers-reduced-motion` và dialog semantics khi chỉnh UI.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

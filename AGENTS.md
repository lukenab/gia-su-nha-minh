# Gia Sư Nhà Mình

Landing page khảo sát nhu cầu cho dự án EXE101. Sản phẩm tập trung vào sinh viên tại Cần Thơ cần tìm gia sư tiếng Anh theo mục tiêu, lịch học và ngân sách.

## Commands

- `npm install` — cài dependency.
- `npm run dev` — chạy tại `http://localhost:8443`.
- `npm run typecheck` — kiểm tra TypeScript.
- `npm test` — chạy Vitest.
- `npm run build` — tạo production build trong `dist/`.
- `npm run preview` — xem production build cục bộ.

## Structure

- `src/api/` — tích hợp dịch vụ gửi biểu mẫu.
- `src/components/` — UI và các section của landing page.
- `src/context/` — trạng thái modal biểu mẫu.
- `src/hooks/` — hành vi dùng lại cho accessibility và metadata.
- `src/layouts/` — layout chung.
- `src/pages/` — trang chủ, privacy, terms và 404.
- `src/routes/` — khai báo React Router.
- `src/test/` — test form, modal và navigation.
- `src/types/` — kiểu dữ liệu biểu mẫu.

## Rules

- Không công bố số liệu, testimonial hoặc hồ sơ gia sư chưa được kiểm chứng.
- Hồ sơ mẫu phải luôn được ghi rõ là “Minh họa”.
- Không hiển thị email, fanpage hoặc thông tin liên hệ giả; để trống biến môi trường cho đến khi kênh thật hoạt động.
- Google Forms phải được cấu hình đầy đủ trước khi form hiển thị trạng thái gửi thành công.
- Giữ khả năng sử dụng bằng bàn phím, focus state, label và dialog semantics khi chỉnh UI.

# Gia Sư Nhà Mình

Landing page của dịch vụ kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh theo mục tiêu, lịch học và ngân sách. Đội ngũ tiếp nhận và xử lý yêu cầu theo mô hình concierge, với thời gian phản hồi trong 24 giờ.

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
- Không sử dụng hồ sơ giả hoặc ngôn ngữ khiến người dùng hiểu nhầm rằng việc so khớp được tự động hóa.
- Các tuyên bố công khai phải nhất quán với mô hình vận hành hiện tại: xử lý thủ công, phản hồi trong 24 giờ, chưa thu phí kết nối và kiểm tra danh tính, chứng chỉ, kinh nghiệm của gia sư.
- Chỉ hiển thị kênh liên hệ đã được xác nhận; Facebook chính thức là `https://facebook.com/giasunhaminh`.
- Google Forms phải được cấu hình đầy đủ trước khi form hiển thị trạng thái gửi thành công.
- Giữ khả năng sử dụng bằng bàn phím, focus state, label và dialog semantics khi chỉnh UI.

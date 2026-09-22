# Gia Sư Nhà Mình

Landing page của dịch vụ kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh dựa trên mục tiêu học tập, lịch học, ngân sách và hình thức học.

Gia Sư Nhà Mình vận hành theo mô hình concierge: đội ngũ tiếp nhận yêu cầu, đối chiếu tiêu chí và phản hồi trong vòng 24 giờ. Hồ sơ gia sư được kiểm tra thông tin danh tính, chứng chỉ và kinh nghiệm trước khi giới thiệu.

## Chạy dự án

Yêu cầu Node.js 22 trở lên.

```bash
npm install
npm run dev
```

Mở `http://localhost:8443`.

## Kiểm tra trước khi deploy

```bash
npm run typecheck
npm test
npm run build
```

## Cấu hình Google Forms

Website dùng hai Google Form riêng: một cho người học và một cho gia sư.

1. Tạo đủ các câu hỏi tương ứng với các key trong `.env.example`.
2. Trong Google Forms, dùng chức năng lấy liên kết điền sẵn để tìm mã `entry.xxxxx` của từng câu hỏi.
3. Sao chép `.env.example` thành `.env.local` khi chạy cục bộ.
4. Điền URL kết thúc bằng `/formResponse` và JSON mapping đầy đủ cho từng form.
5. Không đặt thông tin bí mật trong biến `VITE_*`; các biến này được đưa vào mã phía trình duyệt.

Khi thiếu cấu hình, website hướng người dùng đến Facebook chính thức và không hiển thị thông báo gửi thành công giả.

## Deploy lên Vercel

1. Push source lên repository `lukenab/giasunhaminh`.
2. Import repository vào Vercel. Framework preset là Vite; build command `npm run build`; output `dist`.
3. Thêm các biến từ `.env.example` trong Project Settings → Environment Variables.
4. Thêm `giasunhaminh.id.vn` làm production domain và cấu hình DNS theo bản ghi Vercel cung cấp.
5. Chọn `giasunhaminh.id.vn` làm domain chính; chuyển hướng `www` về domain chính nếu bạn cũng cấu hình `www`.

`vercel.json` đã có rewrite cho `/privacy` và `/terms`, vì vậy hai trang này vẫn hoạt động khi tải lại trực tiếp.

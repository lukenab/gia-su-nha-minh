# Gia Sư Nhà Mình

Landing page phục vụ khảo sát nhu cầu cho dự án EXE101: kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh dựa trên mục tiêu học tập, lịch học và ngân sách.

Website đang ở giai đoạn nghiên cứu, chưa cung cấp dịch vụ kết nối chính thức. Các hồ sơ gia sư hiển thị trên trang đều là nội dung minh họa.

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

Khi thiếu cấu hình, website sẽ báo biểu mẫu đang được hoàn thiện và không hiển thị thông báo gửi thành công giả.

## Deploy lên Vercel

1. Push source lên repository `lukenab/giasunhaminh`.
2. Import repository vào Vercel. Framework preset là Vite; build command `npm run build`; output `dist`.
3. Thêm các biến từ `.env.example` trong Project Settings → Environment Variables.
4. Thêm `giasunhaminh.id.vn` làm production domain và cấu hình DNS theo bản ghi Vercel cung cấp.
5. Chọn `giasunhaminh.id.vn` làm domain chính; chuyển hướng `www` về domain chính nếu bạn cũng cấu hình `www`.

`vercel.json` đã có rewrite cho `/privacy` và `/terms`, vì vậy hai trang này vẫn hoạt động khi tải lại trực tiếp.

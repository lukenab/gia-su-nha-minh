# Gia Sư Nhà Mình

Website kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh 1 kèm 1 dựa trên mục tiêu học tập, lịch học, ngân sách và hình thức học. Đội ngũ tiếp nhận yêu cầu, đối chiếu tiêu chí và phản hồi trong vòng 24 giờ; hồ sơ gia sư được kiểm tra danh tính, chứng chỉ và kinh nghiệm trước khi giới thiệu.

Dự án dùng Next.js 16 (App Router), MongoDB (Mongoose) và CSS Modules. Bản Vite trước đây vẫn nằm trên nhánh `main` cho tới khi nhánh này được merge.

## Chạy dự án

Yêu cầu Node.js 22 trở lên và một MongoDB (local hoặc Atlas).

```bash
cp .env.example .env.local   # điền MONGODB_URI, ADMIN_PASSWORD, ADMIN_SESSION_SECRET (≥ 32 ký tự)
npm install
npm run dev
```

Mở `http://localhost:3000`. Trang quản trị: `/admin/login`.

## Các trang

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Landing page |
| `/get-started` | Biểu mẫu người học 3 bước; `?goal=ielts` chọn sẵn mục tiêu. Lưu vào MongoDB (`POST /api/requests`) và trả về mã yêu cầu |
| `/become-a-tutor` | Hồ sơ gia sư 3 bước (`POST /api/tutor-applications`) |
| `/privacy`, `/terms` | Trang pháp lý |
| `/admin` | Trang quản trị có mật khẩu: yêu cầu học và hồ sơ gia sư (không index, không liên kết công khai) |

Các đường dẫn tiếng Việt cũ (`/yeu-cau-tim-gia-su`, `/chinh-sach-bao-mat`, `/dieu-khoan`) được chuyển hướng 308 sang đường dẫn mới.

## Kiểm tra trước khi deploy

```bash
npm run lint
npm run fmt:check
npm test
npm run build
npm run test:e2e   # sau khi build; dùng MongoDB tạm
```

## Deploy lên Vercel

1. Trong Vercel → Project Settings → Build & Development, đổi Framework Preset sang **Next.js** và xoá Output Directory `dist` nếu còn (`vercel.json` đã khai báo `framework: nextjs`).
2. Thêm biến môi trường `MONGODB_URI`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` cho Production và Preview.
3. Cho phép IP của Vercel truy cập MongoDB Atlas (Network Access).
4. Deploy nhánh này dưới dạng Preview, kiểm tra form, trang quản trị và các trang pháp lý trước khi merge vào `main`.

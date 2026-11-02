import type { Metadata } from "next";

import Link from "next/link";

import { LegalPage } from "@/features/landing/components/legal-page";
import { TERMS_HREF, site } from "@/shared/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Chính sách bảo mật | Gia Sư Nhà Mình",
  description:
    "Cách Gia Sư Nhà Mình thu thập, sử dụng và bảo vệ thông tin của người học và gia sư.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Chính sách bảo mật" updated="02/11/2026">
      <p>
        Chính sách này giải thích cách Gia Sư Nhà Mình tiếp nhận, sử dụng và bảo
        vệ thông tin bạn cung cấp khi gửi yêu cầu tìm gia sư hoặc đăng ký làm
        gia sư trên website.
      </p>

      <h2>1. Thông tin được thu thập</h2>
      <p>
        Khi gửi yêu cầu tìm gia sư, bạn cung cấp họ và tên, email hoặc số điện
        thoại, mục tiêu học, trình độ hiện tại, hình thức học, ngân sách dự kiến
        (nếu có), thời gian có thể học, khu vực và ghi chú. Hệ thống cũng ghi
        lại thời điểm bạn đồng ý với việc xử lý thông tin.
      </p>
      <p>
        Khi đăng ký làm gia sư, bạn cung cấp họ và tên, email, số điện thoại (và
        việc số này có dùng Zalo hay không), trình độ học vấn, trường, chuyên
        ngành, chứng chỉ đã khai, nội dung và trình độ có thể giảng dạy, hình
        thức và khu vực dạy, khung giờ, học phí dự kiến, tiêu đề hồ sơ, phần
        giới thiệu bản thân và ảnh chân dung. Hệ thống ghi lại riêng thời điểm
        bạn đồng ý xử lý dữ liệu, xác nhận thông tin chính xác và đồng ý để đội
        ngũ xác minh hồ sơ.
      </p>

      <h2>2. Mục đích sử dụng</h2>
      <p>
        Thông tin được sử dụng để liên hệ, xác nhận nhu cầu, kiểm tra hồ sơ gia
        sư và hỗ trợ kết nối giữa hai bên. Ảnh chân dung của gia sư được dùng để
        xác minh danh tính và giới thiệu gia sư với người học phù hợp. Gia Sư
        Nhà Mình chỉ xử lý dữ liệu trong phạm vi cần thiết cho các mục đích này.
      </p>

      <h2>3. Nơi lưu trữ</h2>
      <p>
        Yêu cầu gửi từ website được lưu trong cơ sở dữ liệu của Gia Sư Nhà Mình.
        Chỉ thành viên đội ngũ được phân quyền mới có thể truy cập, thông qua
        khu vực quản lý có bảo vệ bằng mật khẩu. Tin nhắn gửi qua Facebook đồng
        thời chịu sự điều chỉnh của chính sách bảo mật của Meta.
      </p>

      <h2>4. Chia sẻ và thời gian lưu trữ</h2>
      <p>
        Gia Sư Nhà Mình không bán dữ liệu cá nhân. Quyền truy cập được giới hạn
        cho thành viên phụ trách việc xác minh và kết nối. Hồ sơ gia sư, gồm ảnh
        chân dung và phần giới thiệu, không được đăng công khai; đội ngũ chỉ gửi
        cho người học khi giới thiệu gia sư đó. Dữ liệu được lưu trong thời gian
        cần thiết để xử lý yêu cầu và sẽ được rà soát, xóa khi không còn phục vụ
        mục đích đã nêu.
      </p>

      <h2>5. Quyền của bạn</h2>
      <p>
        Bạn có thể yêu cầu xem, điều chỉnh hoặc xóa thông tin đã cung cấp bằng
        cách liên hệ qua{" "}
        <a href={site.facebookUrl} target="_blank" rel="noopener noreferrer">
          Facebook chính thức của Gia Sư Nhà Mình
        </a>
        . Vui lòng kèm mã yêu cầu (nếu có) để chúng tôi hỗ trợ nhanh hơn.
      </p>

      <h2>6. Thay đổi chính sách</h2>
      <p>
        Chính sách có thể được cập nhật để phản ánh thay đổi trong quy trình vận
        hành hoặc yêu cầu pháp lý. Ngày cập nhật gần nhất luôn được hiển thị ở
        đầu trang. Xem thêm <Link href={TERMS_HREF}>Điều khoản sử dụng</Link>.
      </p>
    </LegalPage>
  );
}

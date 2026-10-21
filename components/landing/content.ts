import { formatLabels, goalLabels, levelLabels } from "@/lib/options";

import { LEARNER_REQUEST_HREF, TUTOR_APPLICATION_HREF } from "./site";

export { LEARNER_REQUEST_HREF };

/**
 * Public copy for the home route.
 *
 * Claims must stay consistent with what the team has confirmed publicly:
 * learners send a request at /yeu-cau-tim-gia-su without an account and get a
 * reference code; the team replies within 24 hours; tutor identity,
 * certificates and experience are checked before an introduction; the
 * official contact channel is the Facebook page. Device mockups are
 * illustrations, not real data or real profiles.
 */

/** Tutor call to action: the tutor application form. */
export const tutorCta = {
  label: "Đăng ký làm gia sư",
  href: TUTOR_APPLICATION_HREF,
};

export const navLinks = [
  { href: "/#quy-trinh", label: "Cách hoạt động" },
  { href: "/#trai-nghiem", label: "Trải nghiệm" },
  { href: "/#danh-cho-ai", label: "Dành cho ai" },
  { href: "/#cau-hoi", label: "Câu hỏi" },
] as const;

/** Goal shortcuts in the hero; each opens the request form preselected. */
export const heroGoals = (
  ["communication", "ielts", "toeic", "work", "foundation"] as const
).map((key) => ({
  key,
  label: key === "foundation" ? "Tiếng Anh nền tảng" : goalLabels[key],
  href: `${LEARNER_REQUEST_HREF}?goal=${key}`,
}));

export const hero = {
  kicker: "GIA SƯ TIẾNG ANH 1 KÈM 1 · CẦN THƠ",
  titleLines: ["Học tiếng Anh", "theo nhịp của bạn."],
  lead: "Chia sẻ mục tiêu, lịch học và ngân sách. Gia Sư Nhà Mình xem xét nhu cầu và giới thiệu gia sư phù hợp để bạn chủ động lựa chọn.",
  primaryCta: "Gửi yêu cầu tìm gia sư",
  secondaryCta: "Xem quy trình",
  goalsLabel: "Bạn muốn học gì?",
  trust: [
    { value: "24 giờ", label: "Phản hồi mọi yêu cầu" },
    { value: "Hồ sơ đã kiểm tra", label: "Danh tính, chứng chỉ, kinh nghiệm" },
    { value: "1 kèm 1", label: "Online hoặc trực tiếp tại Cần Thơ" },
  ],
  phoneNotes: [
    { label: "MỤC TIÊU", value: goalLabels.communication },
    { label: "THỜI GIAN", value: "Buổi tối trong tuần" },
    { label: "HÌNH THỨC", value: formatLabels.either },
  ],
};

export const manifesto = {
  label: "VÌ SAO CHỌN NHÀ MÌNH?",
  text: "Bạn chia sẻ điều muốn học. Nhà Mình tìm người dạy phù hợp.",
};

export type BentoItem = {
  id: "time" | "account" | "reply" | "verified";
  eyebrow: string;
  title: string;
  text: string;
};

export const bento: BentoItem[] = [
  {
    id: "time",
    eyebrow: "BIỂU MẪU NGẮN",
    title: "3 phút là xong.",
    text: "Mục tiêu, trình độ, hình thức, ngân sách, lịch rảnh — gọn trong một form duy nhất.",
  },
  {
    id: "account",
    eyebrow: "KHÔNG CẦN TÀI KHOẢN",
    title: "Không cần đăng ký. Gửi ngay.",
    text: "Chỉ cần email hoặc số điện thoại để mình liên hệ lại nha.",
  },
  {
    id: "reply",
    eyebrow: "PHẢN HỒI TRONG 24 GIỜ",
    title: "Liên hệ trong 24 giờ.",
    text: "Sau khi nhận yêu cầu, đội ngũ liên hệ để xác nhận mục tiêu, lịch học và ngân sách của bạn.",
  },
  {
    id: "verified",
    eyebrow: "GIA SƯ ĐƯỢC KIỂM TRA",
    title: "Hồ sơ rõ ràng trước khi giới thiệu.",
    text: "Nhà Mình đối chiếu danh tính, chứng chỉ và kinh nghiệm do gia sư cung cấp để bạn có thêm cơ sở lựa chọn.",
  },
];

type JourneyStep = {
  id: string;
  actor: string;
  title: string;
  text: string;
};

export const journey = {
  label: "CÁCH MÌNH HOẠT ĐỘNG",
  title: ["Từ một tin nhắn", "đến một buổi học đầu tiên."],
  intro: "Ba bước đơn giản, có mình đồng hành ở mỗi bước.",
  steps: [
    {
      id: "chia-se",
      actor: "BƯỚC 01 · BẠN",
      title: "Kể mình nghe bạn cần gì.",
      text: "Muốn học gì, trình độ đang ở đâu, học online hay gặp mặt, ngân sách và lịch rảnh — điền xong là nhận mã yêu cầu ngay.",
    },
    {
      id: "xem-xet",
      actor: "BƯỚC 02 · NHÀ MÌNH",
      title: "Mình tìm người dạy hợp với bạn.",
      text: "Trong vòng 24h, mình liên hệ xác nhận nhu cầu rồi tìm gia sư đã được verify phù hợp với bạn.",
    },
    {
      id: "trao-doi",
      actor: "BƯỚC 03 · CẢ HAI",
      title: "Bạn chọn, bạn quyết.",
      text: "Xem thông tin gia sư, chat thử, trao đổi về cách học và học phí. Hợp thì bắt đầu, chưa hợp thì không sao.",
    },
  ] satisfies JourneyStep[],
};

/** Sample values for illustrated cards, using real form labels. */
export const sampleRequest = {
  goal: goalLabels.communication,
  level: levelLabels.basic,
  format: formatLabels.either,
  availability: "Buổi tối trong tuần",
};

export type StripCard = {
  id: "web-form" | "phone-form" | "phone-code" | "contact" | "meet";
  step: string;
  title: string;
  text: string;
};

export const strip = {
  label: "TRẢI NGHIỆM THỰC TẾ",
  title: ["Mượt mà trên mọi thiết bị.", "Chỉ cần mở trình duyệt."],
  intro:
    "Gửi yêu cầu, nhận mã và kết nối với mình — ngay trên thiết bị bạn đang cầm.",
  cards: [
    {
      id: "web-form",
      step: "Máy tính",
      title: "Điền form nhanh trong vài phút",
      text: "Nhu cầu học tập và thông tin liên hệ, rõ ràng từng bước.",
    },
    {
      id: "phone-form",
      step: "Điện thoại",
      title: "Hoặc làm ngay trên điện thoại",
      text: "Giao diện tự fit màn hình nhỏ, không cần cài app.",
    },
    {
      id: "phone-code",
      step: "Sau khi gửi",
      title: "Nhận mã yêu cầu ngay",
      text: "Giữ mã này lại nha — để tiện đối chiếu khi mình liên hệ bạn.",
    },
    {
      id: "contact",
      step: "Trong 24 giờ",
      title: "Mình liên hệ xác nhận",
      text: "Trao đổi thêm để hiểu đúng mục tiêu và điều kiện học của bạn.",
    },
    {
      id: "meet",
      step: "Kết nối",
      title: "Match với gia sư của bạn",
      text: "Xem hồ sơ gia sư đã verify và trao đổi trước khi bắt đầu.",
    },
  ] satisfies StripCard[],
  note: "Hình ảnh giao diện mang tính minh họa.",
};

type AudienceGroup = {
  id: "communication" | "exam" | "tutor";
  titleStrong: string;
  titleSoft: string;
  text: string;
  panelLabel: string;
  panelRows: { label: string; value: string; check?: boolean }[];
  hue: "blue" | "indigo" | "amber";
};

export const audience = {
  label: "Dành cho ai",
  title: ["Nhà Mình", "dành cho ai?"],
  groups: [
    {
      id: "communication",
      titleStrong: "Người học",
      titleSoft: "muốn nói tự tin",
      text: "Bạn muốn tự tin giao tiếp, chuẩn bị phỏng vấn hoặc đi làm — cần một người dạy 1:1 hợp lịch và hợp túi.",
      panelLabel: "VÍ DỤ NHU CẦU",
      panelRows: [
        { label: "Mục tiêu", value: goalLabels.communication },
        { label: "Trình độ", value: levelLabels.basic },
        { label: "Hình thức", value: formatLabels.in_person },
      ],
      hue: "blue",
    },
    {
      id: "exam",
      titleStrong: "Người học",
      titleSoft: "đang luyện thi",
      text: "Đang chuẩn bị IELTS hoặc TOEIC, cần một buddy đồng hành theo đúng trình độ và thời gian còn lại.",
      panelLabel: "VÍ DỤ NHU CẦU",
      panelRows: [
        { label: "Mục tiêu", value: goalLabels.ielts },
        { label: "Trình độ", value: levelLabels.intermediate },
        { label: "Hình thức", value: formatLabels.online },
      ],
      hue: "indigo",
    },
    {
      id: "tutor",
      titleStrong: "Gia sư",
      titleSoft: "dạy đúng thế mạnh",
      text: "Bạn là gia sư tiếng Anh tại Cần Thơ? Chia sẻ chuyên môn và lịch dạy — mình giới thiệu người học hợp với thế mạnh của bạn.",
      panelLabel: "HỒ SƠ GIA SƯ",
      panelRows: [
        { label: "Danh tính", value: "Đã kiểm tra", check: true },
        { label: "Chứng chỉ", value: "Đã kiểm tra", check: true },
        { label: "Kinh nghiệm", value: "Đã kiểm tra", check: true },
      ],
      hue: "amber",
    },
  ] as AudienceGroup[],
};

type FaqItem = {
  question: string;
  answer: string;
  link?: "privacy" | "tutor";
};

export const faq: { label: string; title: string; items: FaqItem[] } = {
  label: "CÂU HỎI THƯỜNG GẶP",
  title: "Những điều bạn nên biết",
  items: [
    {
      question: "Gia Sư Nhà Mình hỗ trợ những nội dung tiếng Anh nào?",
      answer:
        "Mình tập trung vào nhu cầu tiếng Anh của sinh viên tại Cần Thơ: tiếng Anh nền tảng, giao tiếp, phỏng vấn hoặc công việc, IELTS, TOEIC và các mục tiêu cụ thể khác.",
    },
    {
      question: "Sau khi gửi yêu cầu, bao lâu tôi nhận được phản hồi?",
      answer:
        "Mình rep trong vòng 24 giờ. Thời gian tìm được gia sư phù hợp có thể khác nhau tùy mục tiêu, lịch học và ngân sách của bạn.",
    },
    {
      question: "Tôi có thể học trực tuyến hoặc trực tiếp không?",
      answer:
        "Được luôn. Bạn chọn học online, gặp mặt tại Cần Thơ hoặc linh hoạt cả hai khi gửi yêu cầu.",
    },
    {
      question: "Thông tin gia sư được kiểm tra như thế nào?",
      answer:
        "Trước khi giới thiệu, mình kiểm tra danh tính, chứng chỉ liên quan và kinh nghiệm do gia sư cung cấp. Bạn vẫn nên trao đổi trực tiếp với gia sư để tự đánh giá mức độ phù hợp nha.",
    },
    {
      question: "Gửi yêu cầu có chắc chắn tìm được gia sư không?",
      answer:
        "Mình không bảo đảm luôn có gia sư đáp ứng mọi tiêu chí. Yêu cầu càng rõ về mục tiêu, lịch học và ngân sách thì việc tìm gia sư phù hợp càng thuận lợi.",
    },
    {
      question: "Học phí và lịch học được thống nhất như thế nào?",
      answer:
        "Học phí, lịch học và cách thanh toán do bạn và gia sư trao đổi, thống nhất trực tiếp trước khi bắt đầu học.",
    },
    {
      question: "Thông tin tôi gửi được sử dụng cho mục đích gì?",
      answer:
        "Có nha. Thông tin chỉ dùng để liên hệ, xác nhận nhu cầu và hỗ trợ kết nối gia sư cho yêu cầu của bạn.",
      link: "privacy",
    },
    {
      question: "Tôi muốn trở thành gia sư thì làm thế nào?",
      answer:
        "Bạn điền hồ sơ gia sư gồm chuyên môn, kinh nghiệm, chứng chỉ và lịch dạy. Mình liên hệ trong vòng 24 giờ để kiểm tra hồ sơ trước khi giới thiệu người học phù hợp.",
      link: "tutor",
    },
  ],
};

export const finalCta = {
  label: "BẮT ĐẦU NGAY",
  title: ["Sẵn sàng chưa?", "Bắt đầu từ đây."],
  text: "Chỉ cần nói mình nghe bạn muốn học gì. Phần còn lại, để Nhà Mình lo.",
  cta: "Gửi yêu cầu tìm gia sư",
  secondary: "Nhắn tin qua Facebook",
  chips: [
    { label: "MỤC TIÊU", value: goalLabels.communication },
    { label: "LỊCH HỌC", value: "Buổi tối trong tuần" },
    { label: "NGÂN SÁCH", value: "Theo túi của bạn" },
  ],
};

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
  { href: "/#quy-trinh", label: "Quy trình" },
  { href: "/#trai-nghiem", label: "Trải nghiệm" },
  { href: "/#danh-cho-ai", label: "Dành cho ai" },
  { href: "/#cau-hoi", label: "Câu hỏi" },
] as const;

/** Goal shortcuts in the hero; each opens the request form preselected. */
export const heroGoals = (
  ["communication", "ielts", "toeic", "work", "foundation"] as const
).map((key) => ({
  key,
  label: goalLabels[key],
  href: `${LEARNER_REQUEST_HREF}?goal=${key}`,
}));

export const hero = {
  kicker: "GIA SƯ TIẾNG ANH 1 KÈM 1 · CẦN THƠ",
  titleLines: ["Học đúng", "điều mình cần.", "Cùng đúng người."],
  lead: "Chia sẻ mục tiêu, trình độ, lịch học và ngân sách. Đội ngũ Gia Sư Nhà Mình xem từng yêu cầu và giới thiệu gia sư tiếng Anh phù hợp với bạn.",
  primaryCta: "Gửi yêu cầu tìm gia sư",
  secondaryCta: "Xem quy trình",
  goalsLabel: "Bạn đang cần:",
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
  label: "VÌ SAO CHỌN GIA SƯ NHÀ MÌNH",
  text: "Một kết nối tốt bắt đầu bằng việc hiểu nhu cầu thật, không phải bằng một danh sách thật dài.",
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
    title: "Khoảng 3 phút để nói rõ nhu cầu.",
    text: "Mục tiêu, trình độ, hình thức học, ngân sách và thời gian rảnh nằm gọn trong một biểu mẫu.",
  },
  {
    id: "account",
    eyebrow: "KHÔNG CẦN TÀI KHOẢN",
    title: "Gửi ngay, không cần đăng ký.",
    text: "Chỉ cần email hoặc số điện thoại để đội ngũ liên hệ lại.",
  },
  {
    id: "reply",
    eyebrow: "PHẢN HỒI NHANH",
    title: "Phản hồi trong 24 giờ.",
    text: "Đội ngũ liên hệ để xác nhận nhu cầu sau khi nhận được yêu cầu của bạn.",
  },
  {
    id: "verified",
    eyebrow: "GIA SƯ ĐƯỢC KIỂM TRA",
    title: "Hồ sơ rõ ràng trước khi giới thiệu.",
    text: "Danh tính, chứng chỉ và kinh nghiệm của gia sư được đối chiếu trước khi đến với bạn.",
  },
];

export type JourneyStep = {
  id: string;
  actor: string;
  title: string;
  text: string;
};

export const journey = {
  label: "QUY TRÌNH KẾT NỐI",
  title: ["Từ một yêu cầu", "đến một cuộc trao đổi."],
  intro: "Ba bước đơn giản, có người đồng hành ở mỗi bước.",
  steps: [
    {
      id: "chia-se",
      actor: "BƯỚC 01 · BẠN",
      title: "Nói rõ điều mình cần học.",
      text: "Cho chúng tôi biết mục tiêu, trình độ, hình thức học, ngân sách và thời gian bạn có thể học. Không cần tạo tài khoản; gửi xong bạn nhận ngay mã yêu cầu.",
    },
    {
      id: "xem-xet",
      actor: "BƯỚC 02 · ĐỘI NGŨ",
      title: "Đội ngũ tìm gia sư phù hợp.",
      text: "Trong vòng 24 giờ, đội ngũ liên hệ để xác nhận nhu cầu, rồi đối chiếu với những gia sư đã được kiểm tra danh tính, chứng chỉ và kinh nghiệm.",
    },
    {
      id: "trao-doi",
      actor: "BƯỚC 03 · HAI BÊN",
      title: "Trao đổi trước khi quyết định.",
      text: "Bạn xem thông tin gia sư, trao đổi trực tiếp về cách học, lịch học và học phí, rồi tự quyết định có bắt đầu hay không.",
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
  label: "TRẢI NGHIỆM CỦA BẠN",
  title: ["Bắt đầu ở bất cứ đâu.", "Trên máy tính hay điện thoại."],
  intro:
    "Chỉ cần trình duyệt, bạn có thể gửi yêu cầu, nhận mã và trao đổi với đội ngũ ngay trên thiết bị quen thuộc.",
  cards: [
    {
      id: "web-form",
      step: "Máy tính",
      title: "Điền yêu cầu trong vài phút",
      text: "Biểu mẫu gồm nhu cầu học tập và thông tin liên hệ, rõ ràng từng bước.",
    },
    {
      id: "phone-form",
      step: "Điện thoại",
      title: "Hoặc ngay trên điện thoại",
      text: "Giao diện tự điều chỉnh cho màn hình nhỏ, không cần cài thêm ứng dụng.",
    },
    {
      id: "phone-code",
      step: "Sau khi gửi",
      title: "Nhận mã yêu cầu ngay",
      text: "Giữ mã để tiện đối chiếu khi đội ngũ liên hệ với bạn.",
    },
    {
      id: "contact",
      step: "Trong 24 giờ",
      title: "Đội ngũ liên hệ xác nhận",
      text: "Chúng tôi trao đổi thêm để hiểu đúng mục tiêu và điều kiện học của bạn.",
    },
    {
      id: "meet",
      step: "Kết nối",
      title: "Gặp gia sư phù hợp",
      text: "Xem thông tin gia sư đã được kiểm tra hồ sơ và trao đổi trước khi bắt đầu.",
    },
  ] satisfies StripCard[],
  note: "Hình ảnh giao diện mang tính minh họa.",
};

export type AudienceGroup = {
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
  title: ["Gia Sư Nhà Mình", "dành cho ai?"],
  groups: [
    {
      id: "communication",
      titleStrong: "Người học",
      titleSoft: "muốn nói tự tin",
      text: "Sinh viên cần tiếng Anh giao tiếp, phỏng vấn hoặc đi làm, muốn một gia sư 1 kèm 1 hợp lịch và hợp ngân sách.",
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
      text: "Sinh viên chuẩn bị IELTS hoặc TOEIC, cần người đồng hành theo đúng trình độ hiện tại và thời gian còn lại.",
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
      text: "Gia sư tiếng Anh tại Cần Thơ chia sẻ chuyên môn, chứng chỉ, kinh nghiệm và lịch dạy. Sau khi hồ sơ được kiểm tra, đội ngũ giới thiệu người học phù hợp với thế mạnh của bạn.",
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

export type FaqItem = {
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
        "Chúng tôi tập trung vào nhu cầu tiếng Anh của sinh viên tại Cần Thơ: tiếng Anh nền tảng, giao tiếp, phỏng vấn hoặc công việc, IELTS, TOEIC và các mục tiêu cụ thể khác.",
    },
    {
      question: "Sau khi gửi yêu cầu, bao lâu tôi nhận được phản hồi?",
      answer:
        "Đội ngũ phản hồi trong vòng 24 giờ. Thời gian tìm được gia sư phù hợp có thể khác nhau tùy mục tiêu, lịch học và ngân sách của bạn.",
    },
    {
      question: "Tôi có thể học trực tuyến hoặc trực tiếp không?",
      answer:
        "Có. Bạn có thể chọn học trực tuyến, học trực tiếp tại Cần Thơ hoặc linh hoạt cả hai khi gửi yêu cầu.",
    },
    {
      question: "Thông tin gia sư được kiểm tra như thế nào?",
      answer:
        "Trước khi giới thiệu, đội ngũ đối chiếu danh tính, chứng chỉ liên quan và kinh nghiệm do gia sư cung cấp. Bạn vẫn nên trao đổi trực tiếp với gia sư để tự đánh giá mức độ phù hợp.",
    },
    {
      question: "Gửi yêu cầu có chắc chắn tìm được gia sư không?",
      answer:
        "Chúng tôi không bảo đảm luôn có gia sư đáp ứng mọi tiêu chí. Yêu cầu càng rõ về mục tiêu, lịch học và ngân sách thì việc tìm gia sư phù hợp càng thuận lợi.",
    },
    {
      question: "Học phí và lịch học được thống nhất như thế nào?",
      answer:
        "Học phí, lịch học và cách thanh toán do bạn và gia sư trao đổi, thống nhất trực tiếp trước khi bắt đầu học.",
    },
    {
      question: "Thông tin tôi gửi được sử dụng cho mục đích gì?",
      answer:
        "Thông tin chỉ dùng để liên hệ, xác nhận nhu cầu và hỗ trợ kết nối gia sư cho yêu cầu của bạn.",
      link: "privacy",
    },
    {
      question: "Tôi muốn trở thành gia sư thì làm thế nào?",
      answer:
        "Bạn điền hồ sơ gia sư gồm chuyên môn, kinh nghiệm, chứng chỉ và lịch dạy. Đội ngũ liên hệ trong vòng 24 giờ để kiểm tra hồ sơ trước khi giới thiệu người học phù hợp.",
      link: "tutor",
    },
  ],
};

export const finalCta = {
  label: "BẮT ĐẦU NGAY",
  title: ["Bắt đầu từ", "một nhu cầu thật."],
  text: "Cho chúng tôi biết bạn muốn học gì. Phần còn lại bắt đầu bằng việc lắng nghe.",
  cta: "Gửi yêu cầu tìm gia sư",
  secondary: "Nhắn tin qua Facebook",
  chips: [
    { label: "MỤC TIÊU", value: goalLabels.communication },
    { label: "LỊCH HỌC", value: "Buổi tối trong tuần" },
    { label: "NGÂN SÁCH", value: "Theo khả năng của bạn" },
  ],
};

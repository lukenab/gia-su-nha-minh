import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..");
const landingDir = join(root, "components/landing");
const sources = readdirSync(landingDir)
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .map((file) => ({
    file,
    text: readFileSync(join(landingDir, file), "utf8"),
  }));

test("CTAs point to the existing form routes", () => {
  const site = readFileSync(join(landingDir, "site.ts"), "utf8");
  assert.match(site, /LEARNER_REQUEST_HREF = "\/get-started"/);
  assert.match(site, /TUTOR_APPLICATION_HREF = "\/become-a-tutor"/);
  assert.ok(existsSync(join(root, "app/get-started/page.tsx")));
  assert.ok(existsSync(join(root, "app/become-a-tutor/page.tsx")));
});

test("hero uses the approved headline, shortcuts, and trust copy", () => {
  const content = readFileSync(join(landingDir, "content.ts"), "utf8");
  for (const phrase of [
    "GIA SƯ TIẾNG ANH 1 KÈM 1 · CẦN THƠ",
    "Học tiếng Anh",
    "theo nhịp của bạn.",
    "Chia sẻ mục tiêu, lịch học và ngân sách.",
    "Bạn muốn học gì?",
    "Gửi yêu cầu tìm gia sư",
    "Xem quy trình",
    "Phản hồi mọi yêu cầu",
    "Hồ sơ đã kiểm tra",
    "Danh tính, chứng chỉ, kinh nghiệm",
    "Online hoặc trực tiếp tại Cần Thơ",
  ]) {
    assert.ok(content.includes(phrase), `Missing approved copy: ${phrase}`);
  }
  assert.doesNotMatch(
    content,
    /Muốn nói chuyện tự tin 💬|Match gia sư ngay 🔥/,
  );
});

test("legal pages linked from the landing page exist", () => {
  assert.ok(existsSync(join(root, "app/privacy/page.tsx")));
  assert.ok(existsSync(join(root, "app/terms/page.tsx")));
});

test("landing copy avoids claims the product does not support", () => {
  const forbidden = [
    /\bAI\b/,
    /thanh toán (trực tuyến|online|qua)/i,
    /ứng dụng di động/i,
    /sắp phát triển/i,
    /đánh giá gia sư/i,
    /tự động ghép/i,
    /miễn phí|không thu phí|chưa thu phí/i,
  ];
  for (const { file, text } of sources) {
    for (const pattern of forbidden) {
      assert.doesNotMatch(text, pattern, `${file} matches ${pattern}`);
    }
  }
});

test("public landing does not expose internal tools or demo data", () => {
  // The shortcut renders nothing unless the visitor already has a valid admin session.
  const shortcut = readFileSync(join(landingDir, "admin-shortcut.tsx"), "utf8");
  assert.match(shortcut, /\/api\/admin\/session/);
  assert.match(shortcut, /if \(!visible\) return null/);
  for (const { file, text } of sources) {
    if (file === "admin-shortcut.tsx") continue;
    assert.doesNotMatch(text, /["'`]\/admin/, `${file} links to /admin`);
    assert.doesNotMatch(
      text,
      /DEMO|quản trị/i,
      `${file} mentions internal tools`,
    );
  }
});

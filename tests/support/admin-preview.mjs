import mongoose from "mongoose";
import { mkdir } from "node:fs/promises";
// Visual QA on isolated data. No production database or accounts are accessed.
import { createRequire } from "node:module";
import path from "node:path";

import { Connection } from "../../src/features/admin/server/connection-model.ts";
import { LearnerRequest } from "../../src/features/learner-requests/server/model.ts";
import { TutorApplication } from "../../src/features/tutor-applications/server/model.ts";
import { startTestApp } from "./next-server.ts";
const { chromium } = createRequire(import.meta.url)("playwright");
const output = process.env.ADMIN_PREVIEW_OUTPUT;
if (!output)
  throw new Error("Set ADMIN_PREVIEW_OUTPUT to a writable screenshot folder.");
const app = await startTestApp();
let browser;
try {
  await mkdir(output, { recursive: true });
  await mongoose.connect(app.mongoUri);
  const now = new Date();
  const learner = await LearnerRequest.create({
    referenceCode: "DEMO-REQ-001",
    fullName: "Người học DEMO",
    email: "learner@example.com",
    preferredChannel: "email",
    goal: "communication",
    currentLevel: "basic",
    format: "online",
    availability: "Tối trong tuần",
    availabilitySlots: ["weekday_evening"],
    budgetMax: 150000,
    consentAt: now,
    status: "INTRODUCED",
    contactedAt: now,
    assignedTo: "tra@example.com",
  });
  const reviewed = {
    reviewed: true,
    reviewedAt: now,
    reviewedBy: "DEMO",
    note: "Dữ liệu kiểm thử, không phải hồ sơ thật",
  };
  const tutor = await TutorApplication.create({
    referenceCode: "DEMO-TUTOR-001",
    fullName: "Gia sư DEMO",
    phone: "0901234567",
    preferredChannel: "zalo",
    teachingAreas: ["communication"],
    learnerLevels: ["basic"],
    experience: "one_to_two",
    experienceNote: "Dữ liệu kiểm thử giao diện",
    format: "online",
    availabilitySlots: ["weekday_evening"],
    expectedFee: 150000,
    consentAt: now,
    status: "ELIGIBLE",
    acceptingStudents: true,
    reviews: {
      identity: reviewed,
      certificates: reviewed,
      experience: reviewed,
    },
  });
  const connection = await Connection.create({
    request: learner._id,
    tutor: tutor._id,
    requestCode: learner.referenceCode,
    tutorCode: tutor.referenceCode,
    status: "CONFIRMED",
    learnerConfirmedAt: now,
    tutorConfirmedAt: now,
    confirmedAt: now,
    paymentStatus: "UNPAID",
    feeAmount: 50000,
    statusUpdatedAt: now,
    statusUpdatedBy: "DEMO",
    createdBy: "DEMO",
  });
  browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${app.base}/admin/login`);
  if (await page.getByRole("button", { name: "Google", exact: true }).count())
    throw new Error("Google button remains visible");
  await page.getByLabel("Email", { exact: true }).fill("tra@example.com");
  await page.getByLabel("Password", { exact: true }).fill(app.password);
  await Promise.all([
    page.waitForURL(`${app.base}/admin`),
    page.getByRole("button", { name: "Sign in", exact: true }).click(),
  ]);
  await page.getByRole("heading", { name: "Operations overview" }).waitFor();
  await page.screenshot({
    path: path.join(output, "admin-light.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.goto(`${app.base}/admin/connections/${connection._id}`);
  await page
    .getByRole("heading", { name: "Connection fee", exact: true })
    .waitFor();
  await page.screenshot({
    path: path.join(output, "connection-dark.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${app.base}/admin/tutors/${tutor._id}`);
  await page.screenshot({
    path: path.join(output, "tutor-mobile.png"),
    fullPage: true,
  });
  if (
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
  )
    throw new Error("Mobile page overflows horizontally");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Navigation" })
    .waitFor({ state: "visible" });
  await page
    .getByRole("button", { name: "Close navigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Account options for Thanh Trà", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "Log out", exact: true }).click();
  await page.waitForURL(/\/admin\/login\?status=signed_out/);
  const cookies = await page.context().cookies();
  if (cookies.some((c) => c.name === "gsnm_admin"))
    throw new Error("Session cookie remains after logout");
  await page.goto(`${app.base}/admin`);
  await page.waitForURL(/\/admin\/login/);
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    "Visual QA passed: email login, dark mode, desktop/mobile, menu, logout, protected redirect.",
  );
  console.log(`Screenshots: ${output}`);
} finally {
  await browser?.close();
  await mongoose.disconnect();
  await app.stop();
}

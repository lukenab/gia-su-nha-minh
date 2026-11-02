import { z } from "zod";

import {
  certificateLabels,
  educationLabels,
  experienceLabels,
  formatLabels,
  keysOf,
  slotLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "../../shared/lib/options.ts";
import { phonePattern } from "../learner-requests/validation.ts";
import { BIO_MAX, PHOTO_MAX_BYTES } from "./limits.ts";

export { PHOTO_MAX_BYTES };

const tutorFormats = ["online", "in_person", "either"] as const;

const photoPattern = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/;

const certificateSchema = z
  .object({
    type: z.enum(keysOf(certificateLabels)),
    name: z.string().trim().max(60).default(""),
    score: z.string().trim().max(30).default(""),
    // Older forms asked for the year; the team now checks it on the original.
    year: z
      .union([z.coerce.number<number>().int().min(1980).max(2100), z.null()])
      .default(null),
  })
  .refine((value) => value.type !== "other" || value.name.length >= 2, {
    message: "Vui lòng nhập tên chứng chỉ.",
    path: ["name"],
  });

export type CertificateInput = z.infer<typeof certificateSchema>;

export const tutorApplicationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    email: z.email().max(120),
    phone: z.string().trim().regex(phonePattern),
    phoneHasZalo: z.boolean().default(false),
    education: z.enum(keysOf(educationLabels)),
    // "School – major" in one field.
    school: z.string().trim().min(2).max(160),
    certificateList: z.array(certificateSchema).max(8).default([]),
    teachingAreas: z
      .array(z.enum(keysOf(teachingAreaLabels)))
      .min(1)
      .max(7),
    otherTeachingArea: z.string().trim().max(300).default(""),
    learnerLevels: z
      .array(z.enum(keysOf(tutorLevelLabels)))
      .min(1)
      .max(4),
    experience: z.enum(keysOf(experienceLabels)),
    format: z.enum(tutorFormats),
    area: z.string().trim().max(120).default(""),
    availabilitySlots: z
      .array(z.enum(keysOf(slotLabels)))
      .min(1)
      .max(6),
    expectedFee: z.union([
      z.coerce.number<number>().int().min(1).max(2_000_000),
      z.null(),
    ]),
    // Both optional: the team can collect them after the first call.
    bio: z.string().trim().max(BIO_MAX).default(""),
    photo: z
      .string()
      .max(Math.ceil((PHOTO_MAX_BYTES * 4) / 3) + 40)
      .regex(photoPattern)
      .or(z.literal(""))
      .default(""),
    // Accuracy and verification are a statement above the submit button.
    consentPrivacy: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .refine(
    (v) =>
      !v.teachingAreas.includes("other") || v.otherTeachingArea.length >= 5,
    {
      message: "Vui lòng mô tả nội dung khác (ít nhất 5 ký tự).",
      path: ["otherTeachingArea"],
    },
  )
  .refine((v) => v.format === "online" || v.area.length >= 2, {
    message: "Vui lòng nhập khu vực có thể dạy trực tiếp.",
    path: ["area"],
  });

export type TutorApplicationInput = z.infer<typeof tutorApplicationSchema>;

export const tutorFormatLabels = {
  online: formatLabels.online,
  in_person: formatLabels.in_person,
  either: formatLabels.either,
} as const;

/** One line per certificate, e.g. "IELTS 7.5 (2024)", for lists and CSV. */
export function describeCertificates(
  list: readonly {
    type: string;
    name?: string;
    score?: string;
    year?: number | null;
  }[],
) {
  return list
    .map((item) => {
      const name =
        item.type === "other"
          ? item.name || certificateLabels.other
          : (certificateLabels[item.type as keyof typeof certificateLabels] ??
            item.type);
      return [name, item.score, item.year ? `(${item.year})` : ""]
        .filter(Boolean)
        .join(" ");
    })
    .join("; ");
}

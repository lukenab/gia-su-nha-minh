import { z } from "zod";

import {
  channelLabels,
  experienceLabels,
  formatLabels,
  keysOf,
  slotLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "../../shared/lib/options.ts";
import { phonePattern } from "../learner-requests/validation.ts";

const tutorFormats = ["online", "in_person", "either"] as const;

export const tutorApplicationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    email: z.union([z.email().max(120), z.literal("")]),
    phone: z.union([z.string().trim().regex(phonePattern), z.literal("")]),
    preferredChannel: z.enum(keysOf(channelLabels)),
    teachingAreas: z
      .array(z.enum(keysOf(teachingAreaLabels)))
      .min(1)
      .max(7),
    learnerLevels: z
      .array(z.enum(keysOf(tutorLevelLabels)))
      .min(1)
      .max(4),
    experience: z.enum(keysOf(experienceLabels)),
    experienceNote: z.string().trim().min(10).max(600),
    certificates: z.string().trim().max(300).default(""),
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
    consent: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: "Vui lòng cung cấp email hoặc số điện thoại.",
    path: ["email"],
  })
  .refine(
    (value) =>
      !["phone", "zalo"].includes(value.preferredChannel) || value.phone,
    {
      message: "Vui lòng nhập số điện thoại để liên hệ qua kênh đã chọn.",
      path: ["phone"],
    },
  )
  .refine((value) => value.preferredChannel !== "email" || value.email, {
    message: "Vui lòng nhập email nếu bạn muốn được liên hệ qua email.",
    path: ["email"],
  });

export type TutorApplicationInput = z.infer<typeof tutorApplicationSchema>;

export const tutorFormatLabels = {
  online: formatLabels.online,
  in_person: formatLabels.in_person,
  either: formatLabels.either,
} as const;

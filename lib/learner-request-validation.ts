import { z } from "zod";

import {
  channelLabels,
  concernLabels,
  formatLabels,
  goalLabels,
  keysOf,
  levelLabels,
  slotLabels,
  startLabels,
} from "./options.ts";

export const phonePattern = /^\+?[0-9\s().-]{9,20}$/;

export const learnerRequestSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    email: z.union([z.email().max(120), z.literal("")]),
    phone: z.union([z.string().trim().regex(phonePattern), z.literal("")]),
    preferredChannel: z.enum(keysOf(channelLabels)),
    goal: z.enum(keysOf(goalLabels)),
    currentLevel: z.enum(keysOf(levelLabels)),
    concerns: z
      .array(z.enum(keysOf(concernLabels)))
      .max(4)
      .default([]),
    format: z.enum(keysOf(formatLabels)),
    startTime: z.enum(keysOf(startLabels)),
    budgetMax: z.union([
      z.coerce.number<number>().int().min(1).max(2_000_000),
      z.null(),
    ]),
    availabilitySlots: z
      .array(z.enum(keysOf(slotLabels)))
      .min(1)
      .max(6),
    availabilityNote: z.string().trim().max(300).default(""),
    location: z.string().trim().max(120).default(""),
    notes: z.string().trim().max(500).default(""),
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

export type LearnerRequestInput = z.infer<typeof learnerRequestSchema>;

/** Human-readable availability kept for the admin list and older records. */
export function describeAvailability(
  slots: readonly (keyof typeof slotLabels)[],
  note: string,
) {
  const text = slots.map((slot) => slotLabels[slot]).join(", ");
  return note ? `${text}. ${note}` : text;
}

import { z } from "zod";
export const assignmentSchema = z.object({
  email: z.string().max(120),
  expected: z.string().max(120),
});
export const availabilitySchema = z.object({
  accepting: z.boolean(),
  expected: z.boolean().nullable(),
});
export const confirmationSchema = z.object({
  side: z.enum(["learner", "tutor"]),
  revision: z.number().int().min(0),
  note: z.string().trim().min(3).max(500),
});
export const paymentSchema = z.object({
  action: z.enum(["receive", "reverse"]),
  revision: z.number().int().min(0),
  method: z.enum(["transfer", "cash"]),
  reference: z.string().trim().max(120),
  paidOn: z.string().max(40),
  note: z.string().trim().min(3).max(500),
});

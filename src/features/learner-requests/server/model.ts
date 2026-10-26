import mongoose, { Schema } from "mongoose";

import { learnerStatuses } from "../../../shared/lib/workflow.ts";

const historyEntry = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    at: { type: Date, required: true },
    by: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const learnerRequestSchema = new Schema(
  {
    referenceCode: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    preferredChannel: { type: String, default: "" },
    goal: { type: String, required: true },
    currentLevel: { type: String, required: true },
    concerns: { type: [String], default: [] },
    format: { type: String, required: true },
    startTime: { type: String, default: "" },
    budgetMax: { type: Number, default: null },
    availabilitySlots: { type: [String], default: [] },
    // Human-readable summary; also the only availability field on older records.
    availability: { type: String, required: true },
    location: { type: String, default: "" },
    notes: { type: String, default: "" },
    consentAt: { type: Date, required: true },
    // Records created before the workflow only carry NEW, which stays valid.
    status: {
      type: String,
      enum: learnerStatuses,
      default: "NEW",
      index: true,
    },
    statusUpdatedAt: { type: Date, default: null },
    statusUpdatedBy: { type: String, default: "" },
    // Set only when the team marks the request as contacted (not on intake).
    contactedAt: { type: Date, default: null },
    statusHistory: { type: [historyEntry], default: [] },
    internalNote: { type: String, default: "" },
    internalNoteUpdatedAt: { type: Date, default: null },
    internalNoteUpdatedBy: { type: String, default: "" },
  },
  { timestamps: true, collection: "learner_requests" },
);

export const LearnerRequest =
  mongoose.models.LearnerRequest ||
  mongoose.model("LearnerRequest", learnerRequestSchema);

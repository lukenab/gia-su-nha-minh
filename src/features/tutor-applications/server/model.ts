import "server-only";
import mongoose, { Schema } from "mongoose";

import { tutorStatuses } from "../../../shared/lib/workflow.ts";

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

const certificateEntry = new Schema(
  {
    type: { type: String, required: true },
    name: { type: String, default: "" },
    score: { type: String, default: "" },
    year: { type: Number, default: null },
  },
  { _id: false },
);

// One independent review step. Never set automatically from the form.
const reviewStep = new Schema(
  {
    reviewed: { type: Boolean, default: false },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const tutorApplicationSchema = new Schema(
  {
    referenceCode: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    preferredChannel: { type: String, required: true },
    otherTeachingArea: { type: String, default: "" },
    acceptingStudents: { type: Boolean, default: false, index: true },
    availabilityUpdatedAt: { type: Date, default: null },
    availabilityUpdatedBy: { type: String, default: "" },
    teachingAreas: { type: [String], required: true },
    learnerLevels: { type: [String], required: true },
    experience: { type: String, required: true },
    // Self-introduction; optional on the form since 11/2026.
    experienceNote: { type: String, default: "" },
    // Plain-text summary; new applications also keep the structured list.
    certificates: { type: String, default: "" },
    certificateList: { type: [certificateEntry], default: [] },
    education: { type: String, default: "" },
    school: { type: String, default: "" },
    major: { type: String, default: "" },
    phoneHasZalo: { type: Boolean, default: false },
    headline: { type: String, default: "" },
    hasPhoto: { type: Boolean, default: false },
    format: { type: String, required: true },
    area: { type: String, default: "" },
    availabilitySlots: { type: [String], required: true },
    expectedFee: { type: Number, default: null },
    consentAt: { type: Date, required: true },
    // Separate consents from the application form (Decree 13/2023).
    consents: {
      privacyAt: { type: Date, default: null },
      accuracyAt: { type: Date, default: null },
      verificationAt: { type: Date, default: null },
    },
    // Identity, certificates and experience are checked by the team afterwards.
    status: { type: String, enum: tutorStatuses, default: "NEW", index: true },
    statusUpdatedAt: { type: Date, default: null },
    statusUpdatedBy: { type: String, default: "" },
    statusHistory: { type: [historyEntry], default: [] },
    reviews: {
      identity: { type: reviewStep, default: () => ({}) },
      certificates: { type: reviewStep, default: () => ({}) },
      experience: { type: reviewStep, default: () => ({}) },
    },
    internalNote: { type: String, default: "" },
    internalNoteUpdatedAt: { type: Date, default: null },
    internalNoteUpdatedBy: { type: String, default: "" },
  },
  { timestamps: true, collection: "tutor_applications" },
);

export const TutorApplication =
  mongoose.models.TutorApplication ||
  mongoose.model("TutorApplication", tutorApplicationSchema);

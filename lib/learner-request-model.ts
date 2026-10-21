import mongoose, { Schema } from "mongoose";

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
    status: { type: String, enum: ["NEW"], default: "NEW" },
  },
  { timestamps: true, collection: "learner_requests" },
);

export const LearnerRequest =
  mongoose.models.LearnerRequest ||
  mongoose.model("LearnerRequest", learnerRequestSchema);

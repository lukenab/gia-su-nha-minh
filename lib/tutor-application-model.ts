import mongoose, { Schema } from "mongoose";

const tutorApplicationSchema = new Schema(
  {
    referenceCode: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    preferredChannel: { type: String, required: true },
    teachingAreas: { type: [String], required: true },
    learnerLevels: { type: [String], required: true },
    experience: { type: String, required: true },
    experienceNote: { type: String, required: true },
    certificates: { type: String, default: "" },
    format: { type: String, required: true },
    area: { type: String, default: "" },
    availabilitySlots: { type: [String], required: true },
    expectedFee: { type: Number, default: null },
    consentAt: { type: Date, required: true },
    // Identity, certificates and experience are checked by the team afterwards.
    status: { type: String, enum: ["NEW"], default: "NEW" },
  },
  { timestamps: true, collection: "tutor_applications" },
);

export const TutorApplication =
  mongoose.models.TutorApplication ||
  mongoose.model("TutorApplication", tutorApplicationSchema);

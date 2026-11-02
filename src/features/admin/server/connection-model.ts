import "server-only";
import mongoose, { Schema } from "mongoose";

import { connectionStatuses } from "../../../shared/lib/workflow.ts";

const historyEntry = new Schema(
  {
    from: { type: String, default: "" },
    to: { type: String, required: true },
    at: { type: Date, required: true },
    by: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { _id: false },
);

/*
 * A record that the team reviewed or introduced one tutor for one request.
 * Creating it never contacts anyone: introductions happen outside the site.
 */
const connectionSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, required: true, index: true },
    tutor: { type: Schema.Types.ObjectId, required: true, index: true },
    // Reference codes only; names and contact details stay in their records.
    requestCode: { type: String, required: true },
    tutorCode: { type: String, required: true },
    status: {
      type: String,
      enum: connectionStatuses,
      default: "REVIEWING",
      index: true,
    },
    statusUpdatedAt: { type: Date, required: true },
    statusUpdatedBy: { type: String, required: true },
    operationsRevision: { type: Number, default: 0 },
    learnerConfirmedAt: { type: Date, default: null },
    tutorConfirmedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    feeAmount: { type: Number, default: 50000 },
    paymentStatus: {
      type: String,
      enum: ["NOT_DUE", "UNPAID", "PAID"],
      default: "NOT_DUE",
      index: true,
    },
    paidAt: { type: Date, default: null },
    paymentMethod: { type: String, default: "" },
    paymentReference: { type: String, default: "" },
    operationsHistory: { type: [historyEntry], default: [] },
    introducedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    createdBy: { type: String, required: true },
    history: { type: [historyEntry], default: [] },
  },
  { timestamps: true, collection: "connections" },
);

// One record per request–tutor pair; repeated clicks cannot create two.
connectionSchema.index({ request: 1, tutor: 1 }, { unique: true });

export const Connection =
  mongoose.models.Connection || mongoose.model("Connection", connectionSchema);

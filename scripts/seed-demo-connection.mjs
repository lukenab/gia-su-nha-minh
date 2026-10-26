import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const target = new URL(uri);
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (
  target.protocol !== "mongodb:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(target.hostname) ||
  databaseName !== "giasunhaminh"
) {
  throw new Error(
    "Demo data may only be inserted into the local giasunhaminh database",
  );
}

const DEMO_NOTE =
  "[DEMO] Dữ liệu minh họa nội bộ; không phải người dùng hoặc hồ sơ gia sư thật.";
const operator = "DEMO local";
const now = new Date();

async function ensureRecord(collection, referenceCode, document) {
  const existing = await collection.findOne({ referenceCode });
  if (existing) {
    if (!String(existing.internalNote ?? "").startsWith("[DEMO]")) {
      throw new Error(`Reference code ${referenceCode} is already in use`);
    }
    return existing._id;
  }
  const inserted = await collection.insertOne({ referenceCode, ...document });
  return inserted.insertedId;
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 5_000 });
try {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection is not ready");

  const learnerId = await ensureRecord(
    db.collection("learner_requests"),
    "DEMO-REQ-001",
    {
      fullName: "Người học DEMO",
      email: "learner-demo@example.invalid",
      phone: "",
      preferredChannel: "email",
      goal: "communication",
      currentLevel: "basic",
      concerns: ["schedule"],
      format: "online",
      startTime: "asap",
      budgetMax: 150000,
      availabilitySlots: ["weekday_evening"],
      availability: "Tối trong tuần",
      location: "Cần Thơ",
      notes: DEMO_NOTE,
      consentAt: now,
      status: "CONTACTED",
      statusUpdatedAt: now,
      statusUpdatedBy: operator,
      contactedAt: now,
      statusHistory: [
        {
          from: "NEW",
          to: "CONTACTED",
          at: now,
          by: operator,
          note: DEMO_NOTE,
        },
      ],
      internalNote: DEMO_NOTE,
      createdAt: now,
      updatedAt: now,
    },
  );

  const reviewStep = {
    reviewed: true,
    reviewedAt: now,
    reviewedBy: operator,
    note: DEMO_NOTE,
  };
  const tutorId = await ensureRecord(
    db.collection("tutor_applications"),
    "DEMO-TUTOR-001",
    {
      fullName: "Gia sư DEMO",
      email: "tutor-demo@example.invalid",
      phone: "",
      preferredChannel: "email",
      teachingAreas: ["communication"],
      learnerLevels: ["basic"],
      experience: "one_to_two",
      experienceNote: DEMO_NOTE,
      certificates: "Dữ liệu mô phỏng; không có chứng chỉ thật",
      format: "online",
      area: "",
      availabilitySlots: ["weekday_evening"],
      expectedFee: 120000,
      consentAt: now,
      status: "ELIGIBLE",
      statusUpdatedAt: now,
      statusUpdatedBy: operator,
      statusHistory: [
        {
          from: "NEW",
          to: "REVIEWING",
          at: now,
          by: operator,
          note: DEMO_NOTE,
        },
        {
          from: "REVIEWING",
          to: "ELIGIBLE",
          at: now,
          by: operator,
          note: DEMO_NOTE,
        },
      ],
      reviews: {
        identity: reviewStep,
        certificates: reviewStep,
        experience: reviewStep,
      },
      internalNote: DEMO_NOTE,
      createdAt: now,
      updatedAt: now,
    },
  );

  const connections = db.collection("connections");
  const pair = { request: learnerId, tutor: tutorId };
  const existing = await connections.findOne(pair);
  if (existing && existing.createdBy !== operator) {
    throw new Error("A non-demo connection already exists for this pair");
  }
  const result = existing
    ? existing._id
    : (
        await connections.insertOne({
          ...pair,
          requestCode: "DEMO-REQ-001",
          tutorCode: "DEMO-TUTOR-001",
          status: "REVIEWING",
          statusUpdatedAt: now,
          statusUpdatedBy: operator,
          introducedAt: null,
          startedAt: null,
          createdBy: operator,
          history: [
            {
              from: "",
              to: "REVIEWING",
              at: now,
              by: operator,
              note: DEMO_NOTE,
            },
          ],
          createdAt: now,
          updatedAt: now,
        })
      ).insertedId;

  console.log(
    `Demo connection ready: http://localhost:3000/admin/connections/${result}`,
  );
} finally {
  await mongoose.disconnect();
}

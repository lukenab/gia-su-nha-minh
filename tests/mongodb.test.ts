import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";

import { LearnerRequest } from "../lib/learner-request-model.ts";
import { connectToDatabase } from "../lib/mongodb.ts";

test("stores and retrieves a learner request in MongoDB", async () => {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("gsnm_test");

  try {
    await connectToDatabase();
    await LearnerRequest.create({
      referenceCode: "GSNM-TEST-001",
      fullName: "Demo Learner",
      email: "demo@example.com",
      goal: "communication",
      currentLevel: "basic",
      format: "either",
      budgetMax: 150000,
      availability: "Monday and Wednesday evenings",
      consentAt: new Date(),
    });
    const saved = await LearnerRequest.findOne({
      referenceCode: "GSNM-TEST-001",
    }).lean();
    assert.equal(saved?.fullName, "Demo Learner");
    assert.equal(saved?.status, "NEW");
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    delete process.env.MONGODB_URI;
  }
});

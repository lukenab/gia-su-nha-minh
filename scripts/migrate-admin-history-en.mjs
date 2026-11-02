// Rewrites the fixed Vietnamese text the admin wrote into history entries
// (assignment, availability, agreement and payment records) to the English
// text it writes now. Notes and names typed by people are left alone: only
// exact matches of the old fixed strings change.
//
// Dry run by default; pass --apply to write.
//   npm run admin:migrate-en            # show what would change
//   npm run admin:migrate-en -- --apply # change it
import mongoose from "mongoose";
import { createRequire } from "node:module";

import { connectToDatabase } from "../src/shared/server/mongodb.ts";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());

const LOCAL_OPERATOR = { "Quản trị viên (local)": "Administrator (local)" };

/** collection → array field → entry key → { old text: new text } */
const PLAN = {
  learner_requests: {
    assignmentHistory: {
      from: { "Chưa phân công": "Unassigned" },
      to: { "Chưa phân công": "Unassigned" },
      note: { "Phân công xử lý": "Assignment" },
      by: LOCAL_OPERATOR,
    },
    statusHistory: { by: LOCAL_OPERATOR },
  },
  tutor_applications: {
    statusHistory: {
      from: {
        "Chưa xác nhận nhận học viên": "Availability not confirmed",
        "Đang nhận học viên": "Taking learners",
        "Tạm ngừng nhận": "Paused",
      },
      to: {
        "Đang nhận học viên": "Taking learners",
        "Tạm ngừng nhận": "Paused",
      },
      note: { "Cập nhật tình trạng nhận học viên": "Availability updated" },
      by: LOCAL_OPERATOR,
    },
  },
  connections: {
    operationsHistory: {
      from: { "Chưa xác nhận": "Not confirmed" },
      to: {
        "Người học đồng ý": "Learner agreed",
        "Gia sư đồng ý": "Tutor agreed",
        "Đã thu 50.000 đồng": "Received 50,000 VND",
        "Hủy ghi nhận thu phí": "Payment reversed",
      },
      by: LOCAL_OPERATOR,
    },
    history: {
      note: {
        "Đã ghi nhận đồng ý của cả hai bên.": "Both sides' agreement recorded.",
      },
      by: LOCAL_OPERATOR,
    },
  },
};

const apply = process.argv.includes("--apply");

try {
  await connectToDatabase();
  const db = mongoose.connection.db;
  let total = 0;
  for (const [collection, fields] of Object.entries(PLAN)) {
    for (const [field, keys] of Object.entries(fields)) {
      for (const [key, texts] of Object.entries(keys)) {
        for (const [before, after] of Object.entries(texts)) {
          const filter = { [`${field}.${key}`]: before };
          const count = await db.collection(collection).countDocuments(filter);
          if (!count) continue;
          total += count;
          console.log(
            `${collection}.${field}[].${key}: "${before}" → "${after}" (${count} documents)`,
          );
          if (!apply) continue;
          await db
            .collection(collection)
            .updateMany(
              filter,
              { $set: { [`${field}.$[entry].${key}`]: after } },
              { arrayFilters: [{ [`entry.${key}`]: before }] },
            );
        }
      }
    }
  }
  console.log(
    !total
      ? "Nothing to migrate."
      : apply
        ? "Done."
        : "Dry run only. Run again with --apply to write these changes.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

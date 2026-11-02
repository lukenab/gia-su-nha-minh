import assert from "node:assert/strict";
import test from "node:test";

import { csvCell, toCsv } from "../src/features/admin/csv.ts";
test("CSV preserves Vietnamese and quotes; untrusted spreadsheet formulas remain text", () => {
  assert.equal(csvCell('Như Ý, "gia sư"'), '"Như Ý, ""gia sư"""');
  for (const v of ["=1+1", " +SUM(A1)", "@cmd", "-1", "\t=1"])
    assert.ok(csvCell(v).startsWith("\"'"));
  assert.equal(
    toCsv([
      ["Tên", "Phí"],
      ["Như Ý", 50000],
    ]),
    '\uFEFF"Tên","Phí"\r\n"Như Ý","50000"',
  );
});

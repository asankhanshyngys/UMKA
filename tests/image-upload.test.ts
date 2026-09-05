import assert from "node:assert/strict";
import test from "node:test";
import { imageUploadError, maximumImageSize } from "../src/lib/image-upload";

test("public images accept supported formats up to the Vercel-safe limit", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.equal(imageUploadError(maximumImageSize, type), null);
  }
  assert.equal(imageUploadError(1194126, "image/jpeg"), null);
  assert.ok(imageUploadError(maximumImageSize + 1, "image/jpeg"));
});

test("empty uploads and non-image formats are rejected", () => {
  assert.ok(imageUploadError(0, "image/jpeg"));
  for (const type of ["image/svg+xml", "text/html", "application/pdf", ""]) {
    assert.ok(imageUploadError(100, type));
  }
});

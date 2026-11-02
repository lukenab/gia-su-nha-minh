"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import styles from "@/shared/forms/form.module.css";

import { PHOTO_MAX_BYTES, PHOTO_SIZE } from "../limits.ts";
import local from "./tutor-form.module.css";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/** Approximate size of a base64 data URL's payload. */
const bytesOf = (dataUrl: string) =>
  Math.floor(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);

/**
 * Crops the picture to a centred square and re-encodes it as a JPEG in the
 * browser, so only a small image is uploaded and location data in the
 * original file is dropped.
 */
async function toSquareJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(PHOTO_SIZE, side);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  for (const quality of [0.86, 0.75, 0.62, 0.5]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (bytesOf(dataUrl) <= PHOTO_MAX_BYTES) return { dataUrl, side };
  }
  throw new Error("too-large");
}

export function PhotoField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = problem || error;

  async function pick(file: File | undefined) {
    if (!file) return;
    setProblem("");
    if (!ACCEPT.split(",").includes(file.type)) {
      setProblem("Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setProblem("Ảnh gốc cần nhỏ hơn 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const { dataUrl, side } = await toSquareJpeg(file);
      if (side < 300)
        setProblem(
          "Ảnh có độ phân giải thấp. Anh/Chị nên dùng ảnh tối thiểu 300 × 300 px.",
        );
      onChange(dataUrl);
    } catch {
      setProblem("Không đọc được ảnh này. Vui lòng thử một ảnh khác.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>
        Ảnh chân dung
        <span className={styles.optional}>(không bắt buộc)</span>
      </span>
      <div className={local.photo}>
        <div className={local.photoPreview} aria-hidden={!value}>
          {value ? (
            <Image
              src={value}
              alt="Ảnh chân dung đã chọn"
              width={120}
              height={120}
              unoptimized
            />
          ) : (
            <span>Chưa có ảnh</span>
          )}
        </div>
        <div className={local.photoBody}>
          <ul id={`${id}-tips`} className={local.photoTips}>
            <li>
              Chưa có ảnh phù hợp? Anh/Chị có thể gửi sau khi đội ngũ liên hệ.
            </li>
            <li>Ảnh chụp chính diện, rõ khuôn mặt, ánh sáng tốt.</li>
            <li>Nền đơn giản; không đeo kính râm, không dùng ảnh nhóm.</li>
            <li>JPG, PNG hoặc WebP, tối đa 10 MB. Ảnh sẽ được cắt vuông.</li>
          </ul>
          <div className={local.photoActions}>
            <label className={local.add} htmlFor="ta-photo">
              {busy ? "Đang xử lý ảnh…" : value ? "Đổi ảnh" : "Chọn ảnh"}
            </label>
            <input
              ref={input}
              id="ta-photo"
              className={local.fileInput}
              type="file"
              accept={ACCEPT}
              disabled={busy}
              aria-describedby={`${id}-tips${shown ? ` ${id}-error` : ""}`}
              onChange={(event) => void pick(event.target.files?.[0])}
            />
            {value && (
              <button
                type="button"
                className={local.remove}
                onClick={() => {
                  onChange("");
                  setProblem("");
                }}
              >
                Xóa ảnh
              </button>
            )}
          </div>
        </div>
      </div>
      {shown && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {shown}
        </p>
      )}
    </div>
  );
}

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/*
 * Password hashing with scrypt (built into Node, no native dependency).
 * Stored as: scrypt$N$r$p$<salt base64>$<hash base64>.
 */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;

function derive(password: string, salt: Buffer, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      KEY_LENGTH,
      { N: n, r, p, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined) {
  const parts = (stored ?? "").split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    // Spend the same time as a real check so unknown accounts are not obvious.
    await derive(password, Buffer.alloc(16), N, R, P);
    return false;
  }
  const [, n, r, p, salt, hash] = parts;
  const expected = Buffer.from(hash ?? "", "base64");
  const actual = await derive(
    password,
    Buffer.from(salt ?? "", "base64"),
    Number(n),
    Number(r),
    Number(p),
  );
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Returns an error message, or null when the password is acceptable. */
export function passwordProblem(password: string, email?: string) {
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
  if (password.length > MAX_PASSWORD_LENGTH)
    return `Mật khẩu tối đa ${MAX_PASSWORD_LENGTH} ký tự.`;
  if (email && password.toLowerCase().includes(email.split("@")[0]!.toLowerCase()))
    return "Mật khẩu không nên chứa tên email của bạn.";
  if (/^(.)\1+$/.test(password)) return "Mật khẩu quá dễ đoán.";
  return null;
}

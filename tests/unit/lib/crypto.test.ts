import { describe, it, expect } from "vitest";
import { encryptToken, decryptToken } from "@/lib/crypto";

describe("crypto helper", () => {
  const secretKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 32 bytes hex
  const plain = "ya29.sample_oauth_refresh_token_string";

  it("encrypts and successfully decrypts string", () => {
    const encrypted = encryptToken(plain, secretKey);
    expect(encrypted).not.toBe(plain);
    const decrypted = decryptToken(encrypted, secretKey);
    expect(decrypted).toBe(plain);
  });

  it("throws error when decrypting with incorrect secret", () => {
    const encrypted = encryptToken(plain, secretKey);
    const wrongKey = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
    expect(() => decryptToken(encrypted, wrongKey)).toThrow();
  });
});

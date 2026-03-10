import { describe, it, expect } from "vitest";
import { isUser } from "@/lib/utils";

describe("isUser", () => {
  const validUser = {
    id: "user_123",
    name: "Jane Doe",
    email: "jane@example.com",
    emailVerified: true,
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("returns true for a valid user object", () => {
    expect(isUser(validUser)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isUser(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isUser(undefined)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isUser("string")).toBe(false);
    expect(isUser(42)).toBe(false);
  });

  it("returns false when id is missing", () => {
    const { id: _, ...noId } = validUser;
    expect(isUser(noId)).toBe(false);
  });

  it("returns false when name is not a string", () => {
    expect(isUser({ ...validUser, name: 123 })).toBe(false);
  });

  it("returns false when emailVerified is not boolean", () => {
    expect(isUser({ ...validUser, emailVerified: "yes" })).toBe(false);
  });

  it("returns false when createdAt is null", () => {
    expect(isUser({ ...validUser, createdAt: null })).toBe(false);
  });

  it("returns false when updatedAt is null", () => {
    expect(isUser({ ...validUser, updatedAt: null })).toBe(false);
  });
});

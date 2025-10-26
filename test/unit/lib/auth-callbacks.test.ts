import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture options passed to betterAuth during module import
type SendResetArgs = { user: { email: string; name?: string }; url: string };
type SendVerifyArgs = { user: { email: string; name?: string }; url: string };

type CapturedOpts = {
  emailAndPassword: {
    sendResetPassword: (args: SendResetArgs) => Promise<unknown>;
  };
  emailVerification: {
    sendVerificationEmail: (args: SendVerifyArgs) => Promise<unknown>;
  };
} | null;

let capturedOpts: CapturedOpts = null;

vi.mock("better-auth", async () => {
  return {
    betterAuth: (opts: CapturedOpts) => {
      capturedOpts = opts;
      return {};
    },
  };
});

// Mock sendEmail and renderTemplate
const sendEmailMock = vi.fn(async () => undefined);
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));
const renderTemplateMock = vi.fn(() => "<p>html</p>");
vi.mock("@/lib/server/utils", () => ({ renderTemplate: renderTemplateMock }));

// Mock logger so it doesn't print during tests
vi.mock("@/lib/logging", () => ({
  createLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}));

// Mock server db so importing `src/lib/auth` doesn't execute server-only code
vi.mock("@/server/db", () => ({ db: {} }));

beforeEach(() => {
  capturedOpts = null;
  vi.resetAllMocks();
  vi.resetModules();
});

describe("auth callbacks", () => {
  it("registers callbacks and send emails", async () => {
    // Import the auth module which will call our mocked betterAuth
    await import("@/lib/auth");
    expect(capturedOpts).not.toBeNull();

    // capturedOpts is set by the mocked betterAuth above
    const sendReset = capturedOpts!.emailAndPassword.sendResetPassword;
    const sendVerify = capturedOpts!.emailVerification.sendVerificationEmail;

    const user = { email: "a@b.com", name: "Alice" };
    await sendReset({ user, url: "https://example.com/reset" });
    expect(renderTemplateMock).toHaveBeenCalledWith(
      "password-reset",
      expect.any(Object),
    );
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "a@b.com" }),
    );

    sendEmailMock.mockClear();
    await sendVerify({ user, url: "https://example.com/verify" });
    expect(renderTemplateMock).toHaveBeenCalledWith(
      "verification",
      expect.any(Object),
    );
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "a@b.com" }),
    );
  });

  it("propagates errors when sendEmail fails", async () => {
    await import("@/lib/auth");
    const sendReset = capturedOpts!.emailAndPassword.sendResetPassword;
    // simulate sendEmail rejecting
    sendEmailMock.mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );
    await expect(
      sendReset({ user: { email: "x@x.com" }, url: "u" }),
    ).rejects.toThrow("fail");
  });
});

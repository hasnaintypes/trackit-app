import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendEmail } from "@/lib/email";

describe("sendEmail", () => {
  beforeEach(() => {
    // reset env and mocks
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    vi.resetAllMocks();
    try {
      vi.unstubAllGlobals();
    } catch {
      // ignore if not supported in this vitest version
    }
  });

  it("throws when env vars missing", async () => {
    await expect(
      sendEmail({ to: "a@b.com", subject: "s", html: "<p>x</p>" }),
    ).rejects.toThrow("Missing RESEND_API_KEY or EMAIL_FROM env variable");
  });

  it("calls fetch with correct args when env present", async () => {
    process.env.RESEND_API_KEY = "key-123";
    process.env.EMAIL_FROM = "noreply@example.com";
    const mockFetch = vi.fn(
      async (_input?: RequestInfo, _init?: RequestInit) =>
        ({ ok: true }) as Response,
    );
    // Define global fetch (configurable so other tests can overwrite)
    Object.defineProperty(globalThis, "fetch", {
      value: mockFetch,
      configurable: true,
      writable: true,
    });

    await sendEmail({
      to: "user@example.com",
      subject: "Hi",
      html: "<p>Hello</p>",
    });

    expect(mockFetch).toHaveBeenCalled();
    const call = mockFetch.mock.calls[0] as [
      RequestInfo,
      RequestInit | undefined,
    ];
    const requestInfo = call[0];
    let url: string;
    if (typeof requestInfo === "string") {
      url = requestInfo;
    } else if (typeof requestInfo === "object") {
      // Construct a Request to extract the URL in a typesafe way
      url = new Request(requestInfo as RequestInfo).url;
    } else {
      url = String(requestInfo);
    }

    const opts = (call[1] ?? {}) as RequestInit & {
      body?: string;
      headers?: Record<string, string>;
    };
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(opts.body ?? "{}") as { to?: string };
    expect(body.to).toBe("user@example.com");
    expect(opts.headers?.Authorization).toBe("Bearer key-123");
  });
});

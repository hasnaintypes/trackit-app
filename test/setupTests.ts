import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock next/image to render a plain img element in tests
vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
      return React.createElement("img", props);
    },
  };
});

// Mock next/navigation minimally if needed in component tests
// Create a shared router object so tests and components receive the same
// instance (so spies like `push` are the same reference).
const _push = vi.fn();
const _replace = vi.fn();
const _prefetch = vi.fn();
const sharedRouter = {
  push: _push,
  replace: _replace,
  prefetch: _prefetch,
};

vi.mock("next/navigation", () => ({
  useRouter: () => sharedRouter,
  // expose the sharedRouter for tests that need direct access to the spy
  __sharedRouter: sharedRouter,
}));

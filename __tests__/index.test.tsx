import { render, screen } from "@testing-library/react";
import Home from "../pages/index";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Home Page", () => {
  it("should render without crashing", () => {
    // Since the page redirects, we just check it doesn't throw
    expect(() => render(<Home />)).not.toThrow();
  });
});

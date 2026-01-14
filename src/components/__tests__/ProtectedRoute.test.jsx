import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "../ProtectedRoute";

// Mock the AuthContext
vi.mock("../Auth/AuthContext", () => ({
  UserAuth: vi.fn(),
}));

import { UserAuth } from "../Auth/AuthContext";

describe("ProtectedRoute", () => {
  it("redirects to /signin when not authenticated", () => {
    UserAuth.mockReturnValue({ session: null, loading: false });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    UserAuth.mockReturnValue({
      session: { user: { id: "123" } },
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows loading state while checking auth", () => {
    UserAuth.mockReturnValue({ session: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});

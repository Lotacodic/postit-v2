import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";

const mockLogin = vi.fn();

const renderLoginPage = () =>
  render(
    <AuthContext.Provider
      value={{
        userId: null,
        username: null,
        token: null,
        login: mockLogin,
        logout: vi.fn(),
      }}
    >
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your password")).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    renderLoginPage();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("updates email field on input", async () => {
    renderLoginPage();
    const input = screen.getByPlaceholderText("you@example.com");
    await userEvent.type(input, "newman@gmail.com");
    expect(input).toHaveValue("newman@gmail.com");
  });

  it("updates password field on input", async () => {
    renderLoginPage();
    const input = screen.getByPlaceholderText("Your password");
    await userEvent.type(input, "secret123");
    expect(input).toHaveValue("secret123");
  });
});

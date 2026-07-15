import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import client from "../api/client";
import { validateEmail } from "../utils/validation";

type Status = "idle" | "loading" | "sent" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateEmail(email);
    setEmailError(validationMessage);
    if (validationMessage) return;

    setStatus("loading");
    try {
      await client.post("/auth/forgot-password", { email });
      // Always show the generic message on success — the backend already
      // normalized "found" vs "not found" into the same response, so there's
      // nothing more specific to surface here.
      setStatus("sent");
    } catch (err: unknown) {
      // A real failure here (network, 500) is unrelated to account existence,
      // so it's safe to distinguish it from the generic "sent" state.
      setStatus("error");
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Something went wrong. Please try again.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  };

  if (status === "sent") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.subtitle}>
            If an account with that email exists, a password reset link has been sent.
          </p>
          <Link to="/login" style={styles.button}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {status === "error" && <p style={styles.error}>{errorMessage}</p>}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {emailError && <p style={styles.fieldError}>{emailError}</p>}

          <button style={styles.button} type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={styles.footer}>
          Remembered your password?{" "}
          <a href="/login" style={styles.link}>Log in</a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAEEDA",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "48px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#BA7517",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: "0 0 32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
  },
  button: {
    marginTop: "8px",
    padding: "14px",
    fontSize: "16px",
    fontWeight: 700,
    backgroundColor: "#BA7517",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: "13px",
    margin: "-6px 0 0",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
  },
  link: {
    color: "#BA7517",
    fontWeight: 600,
    textDecoration: "none",
  },
};

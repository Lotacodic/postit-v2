import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import client from "../api/client";
import { validatePassword } from "../utils/validation";

type Status = "form" | "submitting" | "success" | "error";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();

  const [status, setStatus] = useState<Status>(token ? "form" : "error");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "Missing reset token. Please request a new reset link."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwMessage = validatePassword(newPassword);
    const matchMessage = newPassword !== confirmPassword ? "Passwords do not match." : undefined;
    setPasswordError(pwMessage);
    setConfirmError(matchMessage);
    if (pwMessage || matchMessage) return;

    setStatus("submitting");
    try {
      await client.post("/auth/reset-password", { token, newPassword });
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Reset link is invalid or has expired.");
      } else {
        setErrorMessage("Reset link is invalid or has expired.");
      }
    }
  };

  if (status === "success") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Password Reset</h1>
          <p style={styles.subtitle}>Your password has been updated. You can now log in.</p>
          <button style={styles.button} onClick={() => navigate("/login")}>
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Reset Failed</h1>
          <p style={styles.error}>{errorMessage}</p>
          <Link to="/forgot-password" style={styles.button}>
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label}>New Password</label>
          <input
            style={styles.input}
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          {passwordError && <p style={styles.fieldError}>{passwordError}</p>}

          <label style={styles.label}>Confirm Password</label>
          <input
            style={styles.input}
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
          />
          {confirmError && <p style={styles.fieldError}>{confirmError}</p>}

          <button style={styles.button} type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
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
    fontSize: "16px",
    color: "#dc2626",
    margin: "0 0 24px",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: "13px",
    margin: "-6px 0 0",
  },
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import client from "../api/client";
import GoogleSignInButton from "../components/GoogleSignInButton";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  type FieldErrors,
} from "../utils/validation";

interface SignupResponse {
  message: string;
  userId: string;
  username: string;
  email: string;
  avatar: string;
}

interface SignupForm {
  username: string;
  email: string;
  password: string;
}

// Maps each field to its validator so handleBlur/validateAll can stay generic
// instead of a hardcoded if/else per field.
const validators: Record<keyof SignupForm, (value: string) => string | undefined> = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword,
};

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    username: "",
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignupForm>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof SignupForm, boolean>>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Re-validate live once a field has been touched, so the error clears
    // as soon as the user fixes it rather than waiting for another blur.
    if (touched[name as keyof SignupForm]) {
      const message = validators[name as keyof SignupForm](value);
      setFieldErrors((prev) => ({ ...prev, [name]: message }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const message = validators[name as keyof SignupForm](value);
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  // Runs every field's validator regardless of touched state, since a user
  // can submit without ever blurring a field (e.g. paste + Enter).
  const validateAll = (): boolean => {
    const nextErrors: FieldErrors<SignupForm> = {
      username: validators.username(form.username),
      email: validators.email(form.email),
      password: validators.password(form.password),
    };
    setFieldErrors(nextErrors);
    setTouched({ username: true, email: true, password: true });
    return Object.values(nextErrors).every((message) => !message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAll()) return;

    setLoading(true);
    try {
      await client.post<SignupResponse>("/auth/signup", form);
      navigate(`/check-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Signup failed. Please try again.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join Postit and share your world</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="yourname"
          />
          {touched.username && fieldErrors.username && (
            <p style={styles.fieldError}>{fieldErrors.username}</p>
          )}

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
          />
          {touched.email && fieldErrors.email && (
            <p style={styles.fieldError}>{fieldErrors.email}</p>
          )}

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Min. 6 characters"
          />
          {touched.password && fieldErrors.password && (
            <p style={styles.fieldError}>{fieldErrors.password}</p>
          )}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

       <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <GoogleSignInButton />

        <p style={styles.footer}>
          Already have an account?{" "}
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
 divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "20px 0",
    color: "#9ca3af",
    fontSize: "13px",
  },
  dividerText: {
    flex: 1,
    borderTop: "1px solid #e5e7eb",
    paddingTop: "8px",
  },
  success: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
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

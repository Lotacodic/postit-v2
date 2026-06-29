import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

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

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await client.post<SignupResponse>("/auth/signup", form);
      setSuccess(`Account created! Welcome, ${data.username}. Redirecting to login...`);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
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
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="yourname"
            required
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

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

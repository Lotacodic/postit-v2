import { useEffect,useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import client from "../api/client";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        const { data } = await client.get("/auth/verify-email", {
          params: { token },
        });
        setStatus("success");
        setMessage(data.message ?? "Email verified successfully.");
      } catch (err: unknown) {
        setStatus("error");
        if (axios.isAxiosError(err)) {
          setMessage(err.response?.data?.message ?? "Verification failed. Please try again.");
        } else {
          setMessage("Verification failed. Please try again.");
        }
      }
    };

    verify();
  }, [token]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {status === "success" ? "Email Verified" : status === "error" ? "Verification Failed" : "Verifying..."}
        </h1>
        <p style={status === "error" ? styles.error : styles.subtitle}>{message}</p>

        {status === "success" && (
          <Link to="/login" style={styles.button}>
            Continue to Login
          </Link>
        )}
        {status === "error" && (
          <Link to="/signup" style={styles.button}>
            Back to Signup
          </Link>
        )}
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
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#BA7517",
    margin: "0 0 16px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#374151",
    margin: "0 0 24px",
  },
  error: {
    fontSize: "16px",
    color: "#dc2626",
    margin: "0 0 24px",
  },
  button: {
    display: "inline-block",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: 700,
    backgroundColor: "#BA7517",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
  },
};

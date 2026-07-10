import { useSearchParams, Link } from "react-router-dom";

export default function CheckEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Check Your Email</h1>
        <p style={styles.subtitle}>
          {email
            ? `We sent a verification link to ${email}.`
            : "We sent you a verification link."}
        </p>
        <p style={styles.body}>
          Click the link in that email to activate your account. The link expires in 24 hours.
        </p>
        <p style={styles.footer}>
          Wrong email or already verified?{" "}
          <Link to="/login" style={styles.link}>Go to login</Link>
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
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#BA7517",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#374151",
    margin: "0 0 16px",
    fontWeight: 600,
  },
  body: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 24px",
  },
  footer: {
    fontSize: "14px",
    color: "#6b7280",
  },
  link: {
    color: "#BA7517",
    fontWeight: 600,
    textDecoration: "none",
  },
};

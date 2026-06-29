import { useAuth } from "../context/AuthContext";

export default function FeedPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "48px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#BA7517" }}>Postit Feed</h1>
      <p>Welcome, {user?.username ?? "friend"} 👋</p>
      <button
        onClick={logout}
        style={{
          marginTop: "24px",
          padding: "10px 20px",
          backgroundColor: "#BA7517",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Log Out
      </button>
    </div>
  );
}

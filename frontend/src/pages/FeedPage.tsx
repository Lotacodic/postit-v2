import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import type { Post } from "../types";

interface PostsResponse {
  message: string;
  posts: Post[];
}

interface CreatePostResponse {
  message: string;
  post: Post;
}

export default function FeedPage() {
  const { username, userId, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const { data } = await client.get<PostsResponse>("/posts");
      setPosts(data.posts);
    } catch {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);

    try {
      const { data } = await client.post<CreatePostResponse>("/posts", {
        postit: newPost,
      });
      setPosts([data.post, ...posts]);
      setNewPost("");
    } catch {
      setError("Failed to create post.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await client.delete(`/posts/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch {
      setError("Failed to delete post.");
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Postit</h1>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Welcome, {username} 👋</span>
          <button style={styles.logoutBtn} onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <form onSubmit={handleCreate} style={styles.createForm}>
          <textarea
            style={styles.textarea}
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
          />
          <button style={styles.postBtn} type="submit" disabled={posting}>
            {posting ? "Posting..." : "Post"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {loading ? (
          <p style={styles.status}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={styles.status}>No posts yet. Be the first!</p>
        ) : (
          <div style={styles.feed}>
            {posts.map((post) => (
              <div key={post._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.author}>@{post.userId.username}</span>
                </div>
                <p style={styles.postText}>{post.postit}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.timestamp}>
                    {new Date(post.createdAt).toLocaleDateString()} ·{" "}
                    {post.commentCount}{" "}
                    {post.commentCount === 1 ? "comment" : "comments"}
                  </span>
                  {post.userId._id === userId && (
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(post._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#FAEEDA",
    fontFamily: "sans-serif",
  },
  header: {
    backgroundColor: "#fff",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  logo: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#BA7517",
    margin: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  welcome: {
    fontSize: "14px",
    color: "#6b7280",
  },
  logoutBtn: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 600,
    backgroundColor: "transparent",
    color: "#BA7517",
    border: "1px solid #BA7517",
    borderRadius: "8px",
    cursor: "pointer",
  },
  main: {
    maxWidth: "640px",
    margin: "32px auto",
    padding: "0 16px",
  },
  createForm: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  textarea: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    resize: "none",
    outline: "none",
    fontFamily: "sans-serif",
  },
  postBtn: {
    alignSelf: "flex-end",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: 700,
    backgroundColor: "#BA7517",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  feed: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardHeader: {
    marginBottom: "8px",
  },
  author: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#BA7517",
  },
  postText: {
    fontSize: "16px",
    color: "#111827",
    margin: "0 0 16px",
    lineHeight: 1.6,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timestamp: {
    fontSize: "13px",
    color: "#9ca3af",
  },
  deleteBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: 600,
    backgroundColor: "transparent",
    color: "#dc2626",
    border: "1px solid #dc2626",
    borderRadius: "6px",
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
  status: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    marginTop: "48px",
  },
};

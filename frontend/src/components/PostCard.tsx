import { useState, useRef } from "react";
import type { Post, Comment } from "../types";
import { getPostComments } from "../api/comments";

interface Props {
  post: Post;
  currentUserId: string | null;
  onDelete: (postId: string) => void;
}

export default function PostCard({ post, currentUserId, onDelete }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  // Tracks whether we've fetched at least once so subsequent toggles skip the network call.
  const hasFetched = useRef(false);

  const handleToggle = async () => {
    if (!hasFetched.current) {
      setLoadingComments(true);
      try {
        const fetched = await getPostComments(post._id);
        setComments(fetched);
        hasFetched.current = true;
      } catch {
        // Non-critical — leave comments empty, UI degrades gracefully.
      } finally {
        setLoadingComments(false);
      }
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.author}>@{post.userId.username}</span>
      </div>
      <p style={styles.postText}>{post.postit}</p>
      <div style={styles.cardFooter}>
        <button style={styles.commentToggle} onClick={handleToggle}>
          {new Date(post.createdAt).toLocaleDateString()} ·{" "}
          {post.commentCount}{" "}
          {post.commentCount === 1 ? "comment" : "comments"}
        </button>
        {post.userId._id === currentUserId && (
          <button style={styles.deleteBtn} onClick={() => onDelete(post._id)}>
            Delete
          </button>
        )}
      </div>

      {isExpanded && (
        <div style={styles.commentsSection}>
          {loadingComments ? (
            <p style={styles.commentsStatus}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p style={styles.commentsStatus}>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} style={styles.comment}>
                <span style={styles.commentAuthor}>
                  @{comment.userId.username}
                </span>
                <p style={styles.commentText}>{comment.text}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  commentToggle: {
    fontSize: "13px",
    color: "#9ca3af",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
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
  commentsSection: {
    marginTop: "16px",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  commentsStatus: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: 0,
  },
  comment: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  commentAuthor: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#BA7517",
  },
  commentText: {
    fontSize: "14px",
    color: "#374151",
    margin: 0,
    lineHeight: 1.5,
  },
};

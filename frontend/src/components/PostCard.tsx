import { useState, useRef } from "react";
import type { Post, Comment } from "../types";
import { getPostComments, createComment } from "../api/comments";
import { likePost } from "../api/posts";
import { followUser, unfollowUser } from "../api/users";

interface Props {
  post: Post;
  currentUserId: string | null;
  followings: string[];
  onDelete: (postId: string) => void;
  onFollowChange: (targetUserId: string, isNowFollowing: boolean) => void;
}

export default function PostCard({
  post,
  currentUserId,
  followings,
  onDelete,
  onFollowChange,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);
  const [localLikes, setLocalLikes] = useState<string[]>(post.likes);
  const hasFetched = useRef(false);

  const likedByMe = currentUserId ? localLikes.includes(currentUserId) : false;
  const isOwnPost = post.userId._id === currentUserId;
  // Derived from parent's followings so toggling one card updates all cards for the same user.
  const isFollowing = currentUserId ? followings.includes(post.userId._id) : false;

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

  const handleLike = async () => {
    if (!currentUserId) return;
    setLocalLikes((prev) =>
      prev.includes(currentUserId)
        ? prev.filter((id) => id !== currentUserId)
        : [...prev, currentUserId]
    );
    try {
      await likePost(post._id);
    } catch {
      // Roll back the optimistic update on failure.
      setLocalLikes((prev) =>
        prev.includes(currentUserId)
          ? prev.filter((id) => id !== currentUserId)
          : [...prev, currentUserId]
      );
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) return;
    try {
      if (isFollowing) {
        await unfollowUser(post.userId._id);
        onFollowChange(post.userId._id, false);
      } else {
        await followUser(post.userId._id);
        onFollowChange(post.userId._id, true);
      }
    } catch {
      // Follow state stays as-is on failure — no optimistic update to roll back.
    }
  };

  const handleCommentCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);

    try {
      const created = await createComment(post._id, newComment);
      setComments((prev) => [...prev, created]);
      setLocalCommentCount((prev) => prev + 1);
      setNewComment("");
    } catch {
      // Could surface an error state here in a future iteration.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.author}>@{post.userId.username}</span>
        {!isOwnPost && currentUserId && (
          <button
            style={isFollowing ? styles.followingBtn : styles.followBtn}
            onClick={handleFollow}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
      <p style={styles.postText}>{post.postit}</p>
      <div style={styles.cardFooter}>
        <button style={styles.commentToggle} onClick={handleToggle}>
          {new Date(post.createdAt).toLocaleDateString()} ·{" "}
          {localCommentCount}{" "}
          {localCommentCount === 1 ? "comment" : "comments"}
        </button>
        <div style={styles.actions}>
          <button
            style={styles.likeBtn}
            onClick={handleLike}
            disabled={!currentUserId}
          >
            {likedByMe ? "❤️" : "🤍"} {localLikes.length}
          </button>
          {isOwnPost && (
            <button
              style={styles.deleteBtn}
              onClick={() => onDelete(post._id)}
            >
              Delete
            </button>
          )}
        </div>
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

          <form onSubmit={handleCommentCreate} style={styles.commentForm}>
            <input
              style={styles.commentInput}
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              style={styles.commentSubmit}
              type="submit"
              disabled={submitting}
            >
              {submitting ? "..." : "Reply"}
            </button>
          </form>
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  author: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#BA7517",
  },
  followBtn: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "#BA7517",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  followingBtn: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "transparent",
    color: "#BA7517",
    border: "1px solid #BA7517",
    borderRadius: "6px",
    cursor: "pointer",
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
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  likeBtn: {
    fontSize: "13px",
    background: "none",
    border: "none",
    padding: "4px 8px",
    cursor: "pointer",
    borderRadius: "6px",
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
  commentForm: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  commentInput: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "sans-serif",
  },
  commentSubmit: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 700,
    backgroundColor: "#BA7517",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

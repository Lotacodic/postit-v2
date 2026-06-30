import client from "./client"
import type { Comment } from "../types"

interface CommentListResponse {
  message: string
  comments: Comment[]
}

interface CommentResponse {
  message: string
  comment: Comment
}

export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const res = await client.get<CommentListResponse>(`/comments/${postId}`)
  return res.data.comments
}

export const createComment = async (
  postId: string,
  text: string
): Promise<Comment> => {
  const res = await client.post<CommentResponse>(`/comments/${postId}`, { text })
  return res.data.comment
}

export const deleteComment = async (commentId: string): Promise<void> => {
  await client.delete(`/comments/${commentId}`)
}

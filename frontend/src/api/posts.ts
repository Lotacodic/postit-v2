import client from "./client";

export const likePost = async (postId: string): Promise<void> => {
  await client.put(`/posts/${postId}/like`);
};

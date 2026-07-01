import client from "./client";
import type { User } from "../types";

interface UsersResponse {
  message: string;
  users: User[];
}

export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await client.get<UsersResponse>("/users");
  return data.users;
};

export const followUser = async (userId: string): Promise<void> => {
  await client.put(`/users/${userId}/follow`);
};

export const unfollowUser = async (userId: string): Promise<void> => {
  await client.put(`/users/${userId}/unfollow`);
};

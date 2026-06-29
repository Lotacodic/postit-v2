export interface User {
  _id: string
  username: string
  email: string
  avatar: string
  followers: string[]
  followings: string[]
  isAdmin: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface FetchedUser {
  imgTag: string
  avatar: string
  username: string
  email: string
}

export interface Post {
  _id: string
  userId: string
  postit: string
  img: string
  file: string[]
  likes: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  postId: string
  userId: string
  text: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  token: string
  userId: string
  username: string
  email: string
  avatar: string
}

export interface SignupResponse {
  message: string
  userId: string
  username: string
  email: string
  avatar: string
}

export interface ApiError {
  message: string
  code?: number
}

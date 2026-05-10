export type Role = 'admin' | 'user';

export interface User {
  _id: string;
  id: string;
  email: string;
  role: Role;
  interests: string[];
  status: 'in-progress' | 'blocked';
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  user: string | User;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  user: string | User;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

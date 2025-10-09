export type UserRole = "admin" | "user" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface DbData {
  admins: User[];
  users: User[];
}

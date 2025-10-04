import { promises as fs } from "fs";
import path from "path";

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

const dbFilePath = path.join(process.cwd(), "../..", "db.json");

async function loadDbData(): Promise<DbData> {
  try {
    const content = await fs.readFile(dbFilePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error loading db.json:", error);
    return { admins: [], users: [] };
  }
}

export async function getUserRole(
  userId: string,
  userEmail: string,
): Promise<UserRole> {
  const dbData = await loadDbData();

  // Check if user is admin
  const isAdmin = dbData.admins.some(
    (admin) => admin.id === userId || admin.email === userEmail,
  );

  if (isAdmin) {
    return "admin";
  }

  // Check if user is regular user
  const isUser = dbData.users.some(
    (user) => user.id === userId || user.email === userEmail,
  );

  if (isUser) {
    return "user";
  }

  return "guest";
}

export async function isAdmin(
  userId: string,
  userEmail: string,
): Promise<boolean> {
  const role = await getUserRole(userId, userEmail);
  return role === "admin";
}

export async function isUser(
  userId: string,
  userEmail: string,
): Promise<boolean> {
  const role = await getUserRole(userId, userEmail);
  return role === "user" || role === "admin";
}

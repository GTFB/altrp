import { promises as fs } from "fs";
import path from "path";

const dbFilePath = path.join(process.cwd(), "db.json");

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface DbData {
  users: unknown[];
  admins: AdminUser[];
}

// Read data from db.json
async function readDbData(): Promise<DbData> {
  try {
    const content = await fs.readFile(dbFilePath, "utf8");
    const data = JSON.parse(content);
    return {
      users: data.users || [],
      admins: data.admins || [],
    };
  } catch (error) {
    console.error("Error reading db.json:", error);
    return { users: [], admins: [] };
  }
}

// Write data to db.json
async function writeDbData(data: DbData): Promise<void> {
  try {
    await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing db.json:", error);
    throw error;
  }
}

// Get list of all admins
export async function getAllAdmins(): Promise<AdminUser[]> {
  const data = await readDbData();
  return data.admins;
}

// Check if user is admin
export async function isUserAdmin(email: string): Promise<boolean> {
  const admins = await getAllAdmins();
  const result = admins.some((admin) => admin.email === email);

  // Debug logging
  console.log("isUserAdmin Debug:", {
    email,
    admins: admins.map((admin) => admin.email),
    result,
  });

  return result;
}

// Add user to admins
export async function addAdmin(user: AdminUser): Promise<void> {
  const data = await readDbData();

  // Check if user is already an admin
  const existingAdminIndex = data.admins.findIndex(
    (admin) => admin.email === user.email,
  );

  if (existingAdminIndex === -1) {
    data.admins.push(user);
    await writeDbData(data);
  }
}

// Remove user from admins
export async function removeAdmin(email: string): Promise<void> {
  const data = await readDbData();
  data.admins = data.admins.filter((admin) => admin.email !== email);
  await writeDbData(data);
}

// Get admin information by email
export async function getAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  const admins = await getAllAdmins();
  return admins.find((admin) => admin.email === email) || null;
}

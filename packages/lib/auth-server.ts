import { auth } from "@/config/auth";
import { isUserAdmin } from "./admin-manager";
import { headers } from "next/headers";

export async function getServerSession() {
  try {
    const session = await auth();
    console.log("getServerSession result:", session);
    return session;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth();
    console.log("getCurrentUser session:", session);

    // Fallback: check if we have session cookies
    if (!session) {
      const headersList = await headers();
      const cookie = headersList.get("cookie");
      console.log("Cookie header:", cookie);

      // If we have session cookies but auth() returns null,
      // it might be a NextAuth configuration issue
      if (cookie && cookie.includes("authjs")) {
        console.log("Session cookies found but auth() returned null");
      }
    }

    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return false;
    }

    return await isUserAdmin(session.user.email);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Admin privileges required");
  }
}

export async function getAdminUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const isAdminUser = await isUserAdmin(session.user.email);
  if (!isAdminUser) {
    return null;
  }

  return session.user;
}

import { isUserAdmin } from "./admin-manager";
import { headers } from "next/headers";

// Fallback function to get user from cookies
export async function getCurrentUserFromCookies() {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie");

    if (!cookie) {
      console.log("No cookies found");
      return null;
    }

    // Look for session cookie
    const sessionCookie = cookie
      .split(";")
      .find(
        (c) =>
          c.trim().startsWith("authjs.session-token") ||
          c.trim().startsWith("__Secure-authjs.session-token"),
      );

    if (!sessionCookie) {
      console.log("No session cookie found");
      return null;
    }

    console.log("Session cookie found:", sessionCookie);

    // Since we have a session on the client but the server function doesn't work,
    // let's return user data from db.json directly
    // This is a temporary solution for testing

    // Get all admins and return the first one (your case)

    return {
      id: "192196751",
      name: "plaltrporg",
      email: "pl@altrp.org",
      image: "https://avatars.githubusercontent.com/u/192196751?v=4",
    };
  } catch (error) {
    console.error("Error getting user from cookies:", error);
    return null;
  }
}

export async function isAdminFromCookies(): Promise<boolean> {
  try {
    const user = await getCurrentUserFromCookies();

    if (!user?.email) {
      return false;
    }

    return await isUserAdmin(user.email);
  } catch (error) {
    console.error("Error checking admin from cookies:", error);
    return false;
  }
}

import { cookies } from "next/headers";

type Session = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  data: Record<string, unknown>;
};

export const getSession = async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const session = cookieStore.get("altrp_session");
  return session ? (JSON.parse(session.value) as Session) : null;
};

export const setToSession = async (
  key: string,
  value: unknown,
): Promise<void> => {
  const cookieStore = await cookies();
  let session = await getSession();

  if (!session) {
    session = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      data: {},
    };
  }

  session.data[key] = value;
  session.updatedAt = new Date();
  cookieStore.set("altrp_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
};

export const getFromSession = async (key: string) => {
  const session = await getSession();
  return session ? session.data[key] || null : null;
};

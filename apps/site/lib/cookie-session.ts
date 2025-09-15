import { cookies } from 'next/headers';

type Session = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    data: any;
}

export const getSession = (): Session | null => {
    const cookieStore = cookies();
    let session: any = cookieStore.get('jambo_session');
    return session ? JSON.parse(session.value) : null;
}

export const setToSession = (key: string, value: any) => {
    const cookieStore = cookies();
    let session = getSession();

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
    cookieStore.set('jambo_session', JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
    });
}

export const getFromSession = (key: string) => {
    const session = getSession();
    return session ? session.data[key] || null : null;
}
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, createAdminSession, passwordMatches, sessionCookieOptions } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (!passwordMatches(password)) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    const session = createAdminSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, session.token, sessionCookieOptions(session.maxAge));
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to sign in. Check the server configuration.' }, { status: 500 });
  }
}

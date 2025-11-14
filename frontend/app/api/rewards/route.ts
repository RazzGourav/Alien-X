// frontend/app/api/rewards/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// We reuse the settings endpoint, which now also returns points/badges
const SETTINGS_URL = 'http://127.0.0.1:8000/api/settings/';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const token = await (getAuth(req) as any).getToken();
    const apiResponse = await fetch(`${SETTINGS_URL}${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to fetch rewards data from backend');
    }

    const data = await apiResponse.json();
    // The settings endpoint now returns { salary, limit, points, badges }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_REWARDS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
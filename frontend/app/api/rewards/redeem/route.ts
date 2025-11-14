// frontend/app/api/rewards/redeem/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

const REDEEM_URL = 'http://127.0.0.1:8000/api/rewards/redeem/';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const token = await (getAuth(req) as any).getToken();
    const apiResponse = await fetch(`${REDEEM_URL}${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to redeem points');
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_REDEEM_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
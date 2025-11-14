// frontend/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

const FASTAPI_URL = 'http://127.0.0.1:8000/api/settings';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { salary, limit } = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!salary || !limit) {
      return new NextResponse('Salary and limit are required', { status: 400 });
    }

    const apiResponse = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        salary: salary,
        limit: limit,
      }),
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to save settings to backend');
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_SETTINGS_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
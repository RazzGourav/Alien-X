// frontend/app/api/analysis/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

const ANALYSIS_URL = 'http://127.0.0.1:8000/api/analysis/';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // We use the same token/header logic that fixed our other bugs
    const token = await (getAuth(req) as any).getToken();
    const apiResponse = await fetch(`${ANALYSIS_URL}${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to fetch analysis data from backend');
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_ANALYSIS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
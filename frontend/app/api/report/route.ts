import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Match backend endpoint /get-report/
const FASTAPI_URL = 'http://127.0.0.1:8000/get-report/';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const apiResponse = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.detail || 'Error generating report');
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_REPORT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
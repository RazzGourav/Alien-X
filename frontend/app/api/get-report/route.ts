// frontend/app/api/get-report/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'; // <-- 1. IMPORT getAuth
import type { NextRequest } from 'next/server'; // <-- 2. IMPORT NextRequest

// This is the URL of your Python backend's report endpoint
const FASTAPI_URL = 'http://127.0.0.1:8000/get-report/';

// 3. ADD `req: NextRequest` AS THE ARGUMENT
export async function POST(req: NextRequest) { 
  try {
    // 4. USE getAuth(req) INSTEAD OF auth()
    const { userId } = getAuth(req);
    
    // (You can keep your debug logs here if you want)
    console.log(`[API_GET_REPORT] Auth result: userId is ${userId}`);

    if (!userId) {
      console.error('[API_GET_REPORT] Auth failed. Returning 401.');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Call the FastAPI backend from the server
    console.log(`[API_GET_REPORT] Auth success for ${userId}. Calling FastAPI backend...`);
    const apiResponse = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error(`[API_GET_REPORT] FastAPI Error: ${errorData.detail}`);
      throw new Error(errorData.detail || 'Error from FastAPI backend');
    }

    const data = await apiResponse.json();
    console.log('[API_GET_REPORT] Success. Returning report to client.');
    
    return NextResponse.json({ report: data.report });

  } catch (error) {
    console.error('[API_GET_REPORT] CATCH BLOCK ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
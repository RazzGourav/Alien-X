// frontend/app/api/ask-document/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// THIS MUST BE A NEW ENDPOINT IN YOUR BACKEND
const FASTAPI_URL = 'http://127.0.0.1:8000/api/ask-document';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req); // <-- 4. USE getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { question, document_data } = await req.json();

    if (!question || !document_data) {
      return new NextResponse('Question and document data are required', {
        status: 400,
      });
    }

    // Call the new FastAPI backend endpoint
    const apiResponse = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        document_data: document_data,
        user_id: userId,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.detail || 'Error from FastAPI backend');
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_ASK_DOCUMENT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
// frontend/app/api/ask/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// This is the URL of your Python backend
const FASTAPI_URL = 'http://127.0.0.1:8000/api/ask';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { question } = await req.json();

    // 1. Get the question from the frontend component
    if (!question) {
      return new NextResponse('Question is required', { status: 400 });
    }

    // 2. Call the FastAPI backend from the server
    const apiResponse = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        user_id: userId,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.detail || 'Error from FastAPI backend');
    }

    const data = await apiResponse.json();

    // 3. Return the AI's answer back to the frontend component
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_ASK_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
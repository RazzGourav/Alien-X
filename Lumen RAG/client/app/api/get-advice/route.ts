import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, document_path } = body;

    // Call Flask backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        user_id: userId,
        document_path
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Transform response to match client expectations
    return NextResponse.json({
      response: data.response,
      sources: data.sources || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get financial advice" }, 
      { status: 500 }
    );
  }
}
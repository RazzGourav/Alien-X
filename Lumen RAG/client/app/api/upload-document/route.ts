import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    formData.append('user_id', userId);

    // Forward to Flask backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/process-document`, 
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in upload-document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
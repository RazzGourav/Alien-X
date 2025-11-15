import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const preferences = await request.json();

    // Here you would typically save the preferences to a database
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Preferences updated successfully',
      preferences 
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
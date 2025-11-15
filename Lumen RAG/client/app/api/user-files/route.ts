import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Making request to ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/user-files?user_id=${userId}`);
    
    // Call Flask backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/user-files?user_id=${userId}`,
      { 
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: Status ${response.status}, Body: ${errorText}`);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successful response from backend:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user-files API route:', error);
    // Return a specific error format
    return NextResponse.json(
      { 
        error: `Failed to fetch user files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        files: [] // Return empty files array to prevent client-side errors
      }, 
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // Get authenticated user with the updated auth method
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Access the filename parameter - use await to satisfy Next.js requirements
    const { filename } = params;
    
    // Fetch the chart file from the Flask backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/reports/charts/${encodeURIComponent(filename)}`,
      { 
        method: 'GET',
        redirect: 'follow',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse('Chart not found', { status: 404 });
      }
      return new NextResponse(`Failed to fetch chart: ${response.statusText}`, { status: response.status });
    }

    // Get the file content as blob
    const imageBlob = await response.blob();
    
    // Return the image with appropriate headers
    return new NextResponse(imageBlob, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving chart:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
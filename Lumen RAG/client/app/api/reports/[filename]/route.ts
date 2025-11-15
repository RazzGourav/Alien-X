import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Access the filename parameter
    const { filename } = await params;
    console.log(`Fetching report: ${filename}`);
    
    // Fetch the report file from the Flask backend
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/reports/${encodeURIComponent(filename)}`;
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      console.error(`Failed to fetch report: ${response.status} ${response.statusText}`);
      return new NextResponse(`Failed to fetch report: ${response.statusText}`, { status: response.status });
    }

    // Get the file content as blob
    const fileBlob = await response.blob();
    
    // Return the file with appropriate headers
    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
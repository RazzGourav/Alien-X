import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Here you would typically:
    // 1. Save the file
    // 2. Process it with OCR or text extraction
    // 3. Extract relevant financial information
    // 4. Store the processed data

    // For now, we'll return a simulated response
    const processedData = {
      documentId: 'doc_' + Date.now(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      extractedData: {
        type: 'financial_statement',
        date: new Date().toISOString(),
        summary: {
          totalAssets: 1000000,
          totalLiabilities: 500000,
          netWorth: 500000,
          monthlyIncome: 10000,
          monthlyExpenses: 8000
        },
        keyPoints: [
          "Strong cash flow position",
          "Moderate debt levels",
          "Diversified investment portfolio"
        ],
        recommendations: [
          "Consider increasing emergency fund",
          "Review investment allocation",
          "Look into tax optimization"
        ]
      }
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error in process-document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
// frontend/app/api/expense-data/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

const SETTINGS_URL = 'http://127.0.0.1:8000/api/settings/';
const EXPENSES_URL = 'http://127.0.0.1:8000/api/expenses/';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch settings and expenses in parallel
    const [settingsRes, expensesRes] = await Promise.all([
      fetch(`${SETTINGS_URL}${userId}`),
      fetch(`${EXPENSES_URL}${userId}`),
    ]);

    if (!settingsRes.ok || !expensesRes.ok) {
      throw new Error('Failed to fetch data from backend');
    }

    const settings = await settingsRes.json();
    const expenses = await expensesRes.json();

    return NextResponse.json({ settings, expenses });
  } catch (error) {
    console.error('[API_EXPENSE_DATA_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
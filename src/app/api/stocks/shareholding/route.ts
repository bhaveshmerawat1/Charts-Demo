import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'RELIANCE';

    // Sample shareholding data - replace with actual API call
    const shareholdingData = [
      { category: 'Promoters', percentage: 50.34 },
      { category: 'Foreign Institutions', percentage: 24.56 },
      { category: 'Domestic Institutions', percentage: 12.45 },
      { category: 'Public', percentage: 8.23 },
      { category: 'Others', percentage: 4.42 },
    ];

    return NextResponse.json(shareholdingData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shareholding data' },
      { status: 500 }
    );
  }
}

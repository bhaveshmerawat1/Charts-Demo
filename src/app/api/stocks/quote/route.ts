import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    // For demo, return sample data matching the expected format
    // In production, replace with actual Twelve Data API call
    // const sampleQuote = {
    //   symbol: symbol,
    //   name: symbol === 'RELIANCE' ? 'Reliance Industries Ltd.' : `${symbol} Company`,
    //   exchange: 'NSE',
    //   currency: 'INR',
    //   datetime: new Date().toISOString(),
    //   timestamp: Date.now(),
    //   open: '1520.50',
    //   high: '1569.00',
    //   low: '1496.30',
    //   close: '1505.10',
    //   volume: '3188000',
    //   previous_close: '1578.10',
    //   change: '-73.00',
    //   percent_change: '-4.63',
    // };

    // Uncomment below for actual API call
    const apiKey = process.env.TWELVE_DATA_API_KEY || 'demo';
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`
    );
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stock quote' },
      { status: 500 }
    );
  }
}

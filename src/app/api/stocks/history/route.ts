import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")!;
  const interval = searchParams.get("interval") || "1day";

  console.log("req ==============", req)
  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=500&apikey=${process.env.TWELVE_DATA_API_KEY}`
  );

  const json = await res.json();

  if (!json.values) return NextResponse.json([]);

  const data = json.values
    .map((v: any) => [
      new Date(v.datetime).getTime(),
      +v.open,
      +v.high,
      +v.low,
      +v.close
    ])
    .reverse();

  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';

// Twelve Data API endpoint for market data
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || 'demo';
const BASE_URL = 'https://api.twelvedata.com/';

export async function GET() {
  try {
    // For demo purposes, we'll return sample data
    // In production, replace with actual Twelve Data API calls

    // Sample data structure matching the reference
    const sampleData = {
      topGainers: [
        { symbol: 'GOYALALUM', name: 'Goyal Aluminiums', price: 10.34, change: 1.72, change_percent: 19.95 },
        { symbol: 'RHO', name: 'Rodium Realty', price: 189.00, change: 31.00, change_percent: 19.62 },
        { symbol: 'UVDH', name: 'United Van Der Horst', price: 262.10, change: 42.80, change_percent: 19.49 },
        { symbol: 'MANAKALUCO', name: 'Manaksia Aluminium', price: 39.12, change: 5.57, change_percent: 16.60 },
        { symbol: 'ROLLT', name: 'Rollatainers', price: 1.43, change: 0.20, change_percent: 16.26 },
        { symbol: 'INDBANK', name: 'Indbank Merch. Bankg', price: 40.08, change: 5.47, change_percent: 15.80 },
        { symbol: 'STDSURF', name: 'Standard Surfactants', price: 55.00, change: 6.80, change_percent: 14.11 },
        { symbol: 'LEADLEAS', name: 'Leading Leasing Fin.', price: 3.73, change: 0.46, change_percent: 14.07 },
        { symbol: 'SHANKARA', name: 'Shankara Bldg. Prod', price: 121.15, change: 14.55, change_percent: 13.64 },
        { symbol: 'KAMOPAINTS', name: 'Kamdhenu Ventures', price: 6.96, change: 0.80, change_percent: 12.99 },
      ],
      topLosers: [
        { symbol: 'MEDICO', name: 'Medico Intercont.', price: 35.60, change: -5.65, change_percent: -13.70 },
        { symbol: 'SYSTMTXC', name: 'Systematix Corp Serv', price: 118.20, change: -17.35, change_percent: -12.80 },
        { symbol: 'IMFA', name: 'Indian Metal & Ferro', price: 1277.20, change: -181.80, change_percent: -12.44 },
        { symbol: 'GOELFOOD', name: 'Goel Food Products', price: 13.40, change: -1.70, change_percent: -11.26 },
        { symbol: 'OBCL', name: 'Orissa BengalCarrier', price: 47.45, change: -5.55, change_percent: -10.47 },
        { symbol: 'VIVIMEDLAB', name: 'Vivimed Labs', price: 12.25, change: -1.36, change_percent: -9.99 },
        { symbol: 'CWD', name: 'CWD', price: 383.00, change: -42.00, change_percent: -9.88 },
        { symbol: 'CONSTRONICS', name: 'Constronics Infra', price: 55.21, change: -5.78, change_percent: -9.48 },
        { symbol: 'SAMSRITA', name: 'Samsrita Labs', price: 18.25, change: -1.70, change_percent: -8.52 },
        { symbol: 'INDFINSEC', name: 'India Finsec', price: 167.75, change: -14.90, change_percent: -8.16 },
      ],
      week52High: [
        { symbol: 'HINDCOPPER', name: 'Hindustan Copper', price: 565.70, day_high: 574.60, week_high_52: 574.60 },
        { symbol: 'NATIONALUM', name: 'National Aluminium', price: 347.70, day_high: 350.35, week_high_52: 350.35 },
        { symbol: 'HINDALCO', name: 'Hindalco', price: 955.05, day_high: 970.80, week_high_52: 970.80 },
        { symbol: 'AXISBANK', name: 'Axis Bank', price: 1293.30, day_high: 1304.60, week_high_52: 1304.60 },
        { symbol: 'VEDL', name: 'Vedanta', price: 621.45, day_high: 627.90, week_high_52: 627.90 },
        { symbol: 'SBIN', name: 'SBI', price: 1022.20, day_high: 1022.55, week_high_52: 1022.55 },
        { symbol: 'UNIONBANK', name: 'Union Bank Of India', price: 166.85, day_high: 167.30, week_high_52: 167.30 },
        { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', price: 9739.00, day_high: 9783.50, week_high_52: 9783.50 },
        { symbol: 'SOUTHBANK', name: 'South Indian Bank', price: 42.22, day_high: 42.50, week_high_52: 42.50 },
        { symbol: 'SAIL', name: 'SAIL', price: 148.65, day_high: 152.80, week_high_52: 152.80 },
      ],
      week52Low: [
        { symbol: 'PREMIERENE', name: 'Premier Energies', price: 765.10, day_low: 748.20, week_low_52: 748.20 },
        { symbol: 'MGL', name: 'Mahanagar Gas', price: 1096.10, day_low: 1089.10, week_low_52: 1089.10 },
        { symbol: 'SYSTMTXC', name: 'Systematix Corp Serv', price: 118.20, day_low: 115.44, week_low_52: 115.44 },
        { symbol: 'PAGEIND', name: 'Page Industries', price: 35090.00, day_low: 34990.00, week_low_52: 34990.00 },
        { symbol: 'TATACHEM', name: 'Tata Chemicals', price: 752.25, day_low: 742.25, week_low_52: 742.25 },
        { symbol: 'CLEAN', name: 'Clean Science', price: 858.05, day_low: 856.00, week_low_52: 856.00 },
        { symbol: 'UBL', name: 'United Breweries', price: 1572.20, day_low: 1564.00, week_low_52: 1564.00 },
        { symbol: 'COHANCE', name: 'Cohance Lifesciences', price: 508.85, day_low: 506.70, week_low_52: 506.70 },
        { symbol: 'NEPTUNE', name: 'Neptune Logitek', price: 55.54, day_low: 54.42, week_low_52: 54.42 },
        { symbol: 'MANYAVAR', name: 'Vedant Fashions', price: 561.40, day_low: 560.00, week_low_52: 560.00 },
      ],
      mostActiveByVolume: [
        { symbol: 'IDEA', name: 'Vodafone Idea', volume: 339484790, value: 186.12 },
        { symbol: 'OLAELEC', name: 'OLA Electric Mobilit', volume: 169095376, value: 726.60 },
        { symbol: 'YESBANK', name: 'Yes Bank', volume: 64819951, value: 245.33 },
        { symbol: 'SOUTHBANK', name: 'South Indian Bank', volume: 51175652, value: 42.22 },
        { symbol: 'AURIGROW', name: 'Auri Grow India', volume: 49306374, value: 89.45 },
        { symbol: 'MANGALAM', name: 'Mangalam Indl. Fin.', volume: 37103607, value: 156.78 },
        { symbol: 'PCJEWELLER', name: 'PC Jeweller', volume: 36089104, value: 234.56 },
        { symbol: 'TFCILTD', name: 'Tourism Finance Corp', volume: 33422754, value: 178.90 },
        { symbol: 'FILATFASH', name: 'Filatex Fashions', volume: 25741105, value: 123.45 },
        { symbol: 'HINDCOPPER', name: 'Hindustan Copper', volume: 23920286, value: 1358.67 },
      ],
      mostActiveByValue: [
        { symbol: 'RELIANCE', name: 'Reliance Industries', volume: 12345678, value: 1866.12 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', volume: 9876543, value: 1489.33 },
        { symbol: 'TRENT', name: 'Trent', volume: 3456789, value: 1443.63 },
        { symbol: 'HINDCOPPER', name: 'Hindustan Copper', volume: 2392028, value: 1358.67 },
        { symbol: 'ICICIBANK', name: 'ICICI Bank', volume: 8765432, value: 1345.54 },
        { symbol: 'CUPID', name: 'Cupid', volume: 2345678, value: 913.19 },
        { symbol: 'OLAELEC', name: 'OLA Electric Mobilit', volume: 1690953, value: 726.60 },
        { symbol: 'NETWEB', name: 'Netweb Technologies', volume: 1234567, value: 704.10 },
        { symbol: 'NATIONALUM', name: 'National Aluminium', volume: 3456789, value: 652.72 },
        { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', volume: 5678901, value: 503.61 },
      ],
    };

    return NextResponse.json(sampleData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

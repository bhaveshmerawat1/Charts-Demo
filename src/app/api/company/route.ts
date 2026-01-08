import { NextResponse } from "next/server";
import { companyData } from "@/components/SubComponents/CompanyDashboard/companyData";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: companyData
  });
}

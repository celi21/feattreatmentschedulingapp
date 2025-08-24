import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    database_url_exists: !!process.env.DATABASE_URL,
    database_url_length: process.env.DATABASE_URL?.length || 0,
    database_url_starts_with: process.env.DATABASE_URL?.substring(0, 12) || 'undefined',
    node_env: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(key => key.includes('DATABASE')),
  });
}

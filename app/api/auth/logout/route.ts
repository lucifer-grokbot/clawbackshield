import { NextResponse } from "next/server";
import { COOKIE, siteUrl } from "@/lib/auth";
export async function POST() { const r = NextResponse.redirect(`${siteUrl()}/`, 303); r.cookies.delete(COOKIE); return r; }

// app/api/revalidate/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const secret = request.headers.get("x-revalidate-secret") || body?.secret || "";

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const path = body.path;
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  try {
    (global as any).revalidatedPaths = (global as any).revalidatedPaths || [];
    (global as any).revalidatedPaths.push(path);
    return NextResponse.json({ revalidated: true, path });
  } catch (err) {
    return NextResponse.json({ error: "Failed to revalidate", details: String(err) }, { status: 500 });
  }
}

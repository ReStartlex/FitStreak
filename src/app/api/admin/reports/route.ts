import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth-admin";
import { unauthorized, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reports — moderator-only listing of reports.
 * Defaults to OPEN status, supports `?status=` filter.
 */
export async function GET(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin.ok) return unauthorized();

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status") ?? "OPEN";
    const allowed = new Set(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]);
    const status = allowed.has(statusParam) ? statusParam : "OPEN";

    const reports = await db.report.findMany({
      where: { status: status as "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        category: true,
        comment: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        resolvedBy: true,
        reporter: {
          select: { id: true, username: true, name: true, email: true },
        },
        target: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            currentStreak: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    return serverError(error);
  }
}

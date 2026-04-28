import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth-admin";
import {
  badRequest,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]),
  note: z.string().max(500).optional(),
});

/**
 * PATCH /api/admin/reports/:id — change a report's moderation state.
 * Stamps `resolvedBy` / `resolvedAt` when transitioning to a
 * terminal state. Note is appended to the comment field for context.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await isAdmin();
    if (!admin.ok) return unauthorized();

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return badRequest("VALIDATION");

    const existing = await db.report.findUnique({
      where: { id },
      select: { id: true, comment: true },
    });
    if (!existing) return notFound("Report not found");

    const terminal =
      parsed.data.status === "RESOLVED" || parsed.data.status === "DISMISSED";
    const noteSuffix = parsed.data.note
      ? `\n\n[mod ${admin.email}]: ${parsed.data.note}`
      : "";

    const updated = await db.report.update({
      where: { id },
      data: {
        status: parsed.data.status,
        comment: noteSuffix
          ? (existing.comment ?? "") + noteSuffix
          : existing.comment,
        resolvedAt: terminal ? new Date() : null,
        resolvedBy: terminal ? admin.userId : null,
      },
      select: { id: true, status: true, resolvedAt: true },
    });

    return NextResponse.json({ ok: true, report: updated });
  } catch (error) {
    return serverError(error);
  }
}

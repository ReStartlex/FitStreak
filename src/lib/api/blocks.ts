import { db } from "@/lib/db";

interface BlockedSets {
  /** People who I block (I shouldn't see them anywhere social). */
  iBlocked: Set<string>;
  /** People who blocked me (they shouldn't see me anywhere social). */
  blockedMe: Set<string>;
  /** Convenience union — used to filter feeds in both directions. */
  any: Set<string>;
}

/**
 * Loads both directions of the block graph for a single user. Cheap
 * (two indexed reads) and lets callers filter feeds/lists with a Set
 * lookup. For unauthenticated visitors returns empty sets.
 */
export async function getBlockedSets(
  userId: string | null,
): Promise<BlockedSets> {
  if (!userId) {
    return { iBlocked: new Set(), blockedMe: new Set(), any: new Set() };
  }
  const [iBlocked, blockedMe] = await Promise.all([
    db.block.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    }),
  ]);
  const iBlockedSet = new Set(iBlocked.map((b) => b.blockedId));
  const blockedMeSet = new Set(blockedMe.map((b) => b.blockerId));
  const any = new Set<string>();
  for (const id of iBlockedSet) any.add(id);
  for (const id of blockedMeSet) any.add(id);
  return { iBlocked: iBlockedSet, blockedMe: blockedMeSet, any };
}

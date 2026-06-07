import { prisma } from "@/lib/prisma";

export type MaterialStatus = "undiscovered" | "discovered" | "restored";

export function statusFromProgress(progress?: {
  discoveredAt: Date | null;
  restoredAt: Date | null;
} | null): MaterialStatus {
  if (!progress) return "undiscovered";
  if (progress.restoredAt) return "restored";
  if (progress.discoveredAt) return "discovered";
  return "undiscovered";
}

/**
 * Marks a fragment as found by the user (first visit to the material page).
 * Sets discoveredAt only once — subsequent visits don't overwrite it.
 */
export async function markMaterialDiscovered(userId: number, materialId: number) {
  await prisma.materialProgress.upsert({
    where: { userId_materialId: { userId, materialId } },
    update: {},
    create: { userId, materialId, discoveredAt: new Date() },
  });
}

/**
 * Marks a fragment as restored (the related task has been passed).
 * Restoration implies discovery, so discoveredAt is backfilled if missing.
 */
export async function markMaterialRestored(userId: number, materialId: number) {
  const now = new Date();

  await prisma.materialProgress.upsert({
    where: { userId_materialId: { userId, materialId } },
    update: { restoredAt: now },
    create: { userId, materialId, discoveredAt: now, restoredAt: now },
  });

  await prisma.materialProgress.updateMany({
    where: { userId, materialId, discoveredAt: null },
    data: { discoveredAt: now },
  });
}

/**
 * Batch-loads progress for a set of materials and returns a lookup map
 * keyed by materialId, ready to drive map/library UI states.
 */
export async function getMaterialStatusMap(
  userId: number | null,
  materialIds: number[]
): Promise<Map<number, MaterialStatus>> {
  const map = new Map<number, MaterialStatus>();

  if (!userId || materialIds.length === 0) {
    return map;
  }

  const records = await prisma.materialProgress.findMany({
    where: { userId, materialId: { in: materialIds } },
    select: { materialId: true, discoveredAt: true, restoredAt: true },
  });

  for (const record of records) {
    map.set(record.materialId, statusFromProgress(record));
  }

  return map;
}

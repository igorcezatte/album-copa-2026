export interface RemoteStickerEntry {
  sticker_id: string
  quantity: number
}

export interface LocalStickers {
  [stickerId: string]: { quantity: number }
}

export function buildSyncPayload(stickers: LocalStickers): RemoteStickerEntry[] {
  return Object.entries(stickers)
    .filter(([, entry]) => entry.quantity >= 1)
    .map(([sticker_id, entry]) => ({ sticker_id, quantity: entry.quantity }))
}

export function mergeStickerData(
  local: LocalStickers,
  remote: RemoteStickerEntry[],
): LocalStickers {
  const merged: LocalStickers = { ...local }

  for (const { sticker_id, quantity } of remote) {
    const localQty = local[sticker_id]?.quantity ?? 0
    merged[sticker_id] = { quantity: Math.max(localQty, quantity) }
  }

  return merged
}

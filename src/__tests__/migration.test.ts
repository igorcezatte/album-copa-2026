import { buildSyncPayload, mergeStickerData } from '@/utils/migration'

describe('buildSyncPayload', () => {
  it('converts Zustand stickers to API array', () => {
    const stickers = { 'BRA_3': { quantity: 2 }, 'ARG_5': { quantity: 1 } }
    const payload = buildSyncPayload(stickers)
    expect(payload).toHaveLength(2)
    expect(payload).toContainEqual({ sticker_id: 'BRA_3', quantity: 2 })
    expect(payload).toContainEqual({ sticker_id: 'ARG_5', quantity: 1 })
  })

  it('returns empty array for no stickers', () => {
    expect(buildSyncPayload({})).toEqual([])
  })

  it('only includes stickers with quantity >= 1', () => {
    const stickers = { 'BRA_3': { quantity: 1 } }
    const payload = buildSyncPayload(stickers)
    expect(payload).toHaveLength(1)
  })
})

describe('mergeStickerData', () => {
  it('includes remote stickers not in local', () => {
    const merged = mergeStickerData({}, [{ sticker_id: 'ARG_5', quantity: 2 }])
    expect(merged['ARG_5']).toEqual({ quantity: 2 })
  })

  it('keeps local quantity when higher than remote', () => {
    const local = { 'BRA_3': { quantity: 3 } }
    const remote = [{ sticker_id: 'BRA_3', quantity: 1 }]
    const merged = mergeStickerData(local, remote)
    expect(merged['BRA_3'].quantity).toBe(3)
  })

  it('uses remote quantity when higher than local', () => {
    const local = { 'BRA_3': { quantity: 1 } }
    const remote = [{ sticker_id: 'BRA_3', quantity: 5 }]
    const merged = mergeStickerData(local, remote)
    expect(merged['BRA_3'].quantity).toBe(5)
  })

  it('keeps local-only stickers', () => {
    const local = { 'BRA_3': { quantity: 1 } }
    const merged = mergeStickerData(local, [])
    expect(merged['BRA_3']).toEqual({ quantity: 1 })
  })

  it('handles both empty', () => {
    expect(mergeStickerData({}, [])).toEqual({})
  })

  it('merges multiple stickers correctly', () => {
    const local = { 'BRA_3': { quantity: 2 }, 'ARG_5': { quantity: 1 } }
    const remote = [
      { sticker_id: 'BRA_3', quantity: 1 },
      { sticker_id: 'MEX_7', quantity: 3 },
    ]
    const merged = mergeStickerData(local, remote)
    expect(merged['BRA_3'].quantity).toBe(2) // local wins
    expect(merged['ARG_5'].quantity).toBe(1) // local only
    expect(merged['MEX_7'].quantity).toBe(3) // remote only
  })
})

import { useAlbumStore, stickerId } from '@/store/albumStore'

function resetStore() {
  useAlbumStore.setState({ stickers: {} })
}

beforeEach(() => {
  resetStore()
  localStorage.clear()
})

describe('stickerId helper', () => {
  it('formats id correctly', () => {
    expect(stickerId('BRA', '1')).toBe('BRA_1')
    expect(stickerId('FWC', '1')).toBe('FWC_1')
    expect(stickerId('CC', '14')).toBe('CC_14')
  })
})

describe('collect / uncollect', () => {
  it('collects a sticker (quantity = 1)', () => {
    const { collect } = useAlbumStore.getState()
    collect('BRA_1')
    expect(useAlbumStore.getState().getQuantity('BRA_1')).toBe(1)
  })

  it('isCollected returns true after collect', () => {
    useAlbumStore.getState().collect('BRA_1')
    expect(useAlbumStore.getState().isCollected('BRA_1')).toBe(true)
  })

  it('isCollected returns false for uncollected sticker', () => {
    expect(useAlbumStore.getState().isCollected('BRA_1')).toBe(false)
  })

  it('uncollect removes a sticker', () => {
    const store = useAlbumStore.getState()
    store.collect('BRA_1')
    store.uncollect('BRA_1')
    expect(useAlbumStore.getState().isCollected('BRA_1')).toBe(false)
    expect(useAlbumStore.getState().getQuantity('BRA_1')).toBe(0)
  })

  it('collecting same sticker twice keeps quantity = 1', () => {
    useAlbumStore.getState().collect('BRA_1')
    useAlbumStore.getState().collect('BRA_1')
    expect(useAlbumStore.getState().getQuantity('BRA_1')).toBe(1)
  })
})

describe('duplicates', () => {
  it('addDuplicate increments quantity', () => {
    const store = useAlbumStore.getState()
    store.collect('ARG_5')
    store.addDuplicate('ARG_5')
    expect(useAlbumStore.getState().getQuantity('ARG_5')).toBe(2)
  })

  it('addDuplicate works on uncollected sticker (starts from 0)', () => {
    useAlbumStore.getState().addDuplicate('ARG_5')
    expect(useAlbumStore.getState().getQuantity('ARG_5')).toBe(1)
  })

  it('removeDuplicate decrements quantity', () => {
    const store = useAlbumStore.getState()
    store.collect('ENG_3')
    store.addDuplicate('ENG_3')
    store.removeDuplicate('ENG_3')
    expect(useAlbumStore.getState().getQuantity('ENG_3')).toBe(1)
  })

  it('removeDuplicate when quantity=1 removes sticker (uncollects)', () => {
    const store = useAlbumStore.getState()
    store.collect('ENG_3')
    store.removeDuplicate('ENG_3')
    expect(useAlbumStore.getState().isCollected('ENG_3')).toBe(false)
  })

  it('getDuplicates returns stickers with quantity > 1', () => {
    const store = useAlbumStore.getState()
    store.collect('BRA_1')
    store.collect('BRA_2')
    store.addDuplicate('BRA_1')
    store.addDuplicate('BRA_1')

    const dups = useAlbumStore.getState().getDuplicates()
    expect(dups).toHaveLength(1)
    expect(dups[0].id).toBe('BRA_1')
    expect(dups[0].quantity).toBe(2)
  })

  it('getDuplicates returns empty when no duplicates', () => {
    useAlbumStore.getState().collect('BRA_1')
    expect(useAlbumStore.getState().getDuplicates()).toHaveLength(0)
  })
})

describe('getTeamProgress', () => {
  it('starts at 0/20', () => {
    const p = useAlbumStore.getState().getTeamProgress('BRA')
    expect(p.collected).toBe(0)
    expect(p.total).toBe(20)
  })

  it('counts collected stickers correctly', () => {
    const store = useAlbumStore.getState()
    store.collect(stickerId('BRA', '1'))
    store.collect(stickerId('BRA', '2'))
    store.collect(stickerId('BRA', '3'))
    const p = useAlbumStore.getState().getTeamProgress('BRA')
    expect(p.collected).toBe(3)
    expect(p.total).toBe(20)
  })

  it('does not count duplicates as extra stickers', () => {
    const store = useAlbumStore.getState()
    store.collect(stickerId('BRA', '1'))
    store.addDuplicate(stickerId('BRA', '1'))
    store.addDuplicate(stickerId('BRA', '1'))
    const p = useAlbumStore.getState().getTeamProgress('BRA')
    expect(p.collected).toBe(1)
  })

  it('returns 0/0 for unknown team', () => {
    const p = useAlbumStore.getState().getTeamProgress('ZZZ')
    expect(p.collected).toBe(0)
    expect(p.total).toBe(0)
  })
})

describe('getGroupProgress', () => {
  it('starts at 0/80 for group A (4 teams × 20)', () => {
    const p = useAlbumStore.getState().getGroupProgress('A')
    expect(p.collected).toBe(0)
    expect(p.total).toBe(80)
  })

  it('accumulates correctly across teams', () => {
    const store = useAlbumStore.getState()
    store.collect(stickerId('BRA', '1'))
    store.collect(stickerId('MAR', '1'))
    const p = useAlbumStore.getState().getGroupProgress('C')
    expect(p.collected).toBe(2)
    expect(p.total).toBe(80)
  })
})

describe('getTotalProgress', () => {
  it('starts at 0/993', () => {
    const p = useAlbumStore.getState().getTotalProgress()
    expect(p.collected).toBe(0)
    expect(p.total).toBe(993)
  })

  it('counts stickers from FWC section', () => {
    useAlbumStore.getState().collect(stickerId('FWC', '1'))
    const p = useAlbumStore.getState().getTotalProgress()
    expect(p.collected).toBe(1)
  })

  it('counts stickers from CC section', () => {
    useAlbumStore.getState().collect(stickerId('CC', '1'))
    const p = useAlbumStore.getState().getTotalProgress()
    expect(p.collected).toBe(1)
  })
})

describe('getSectionProgress', () => {
  it('FWC starts at 0/19', () => {
    const p = useAlbumStore.getState().getSectionProgress('FWC')
    expect(p.total).toBe(19)
    expect(p.collected).toBe(0)
  })

  it('CC starts at 0/14', () => {
    const p = useAlbumStore.getState().getSectionProgress('CC')
    expect(p.total).toBe(14)
    expect(p.collected).toBe(0)
  })

  it('FWC counts correctly after collect', () => {
    useAlbumStore.getState().collect(stickerId('FWC', '1'))
    useAlbumStore.getState().collect(stickerId('FWC', '2'))
    const p = useAlbumStore.getState().getSectionProgress('FWC')
    expect(p.collected).toBe(2)
  })
})

describe('getMissing', () => {
  it('returns all 20 numbers when nothing collected', () => {
    const missing = useAlbumStore.getState().getMissing('BRA')
    expect(missing).toHaveLength(20)
  })

  it('excludes collected stickers from missing list', () => {
    useAlbumStore.getState().collect(stickerId('BRA', '1'))
    useAlbumStore.getState().collect(stickerId('BRA', '5'))
    const missing = useAlbumStore.getState().getMissing('BRA')
    expect(missing).toHaveLength(18)
    expect(missing).not.toContain('1')
    expect(missing).not.toContain('5')
  })

  it('returns empty array when all stickers collected', () => {
    const store = useAlbumStore.getState()
    for (let i = 1; i <= 20; i++) {
      store.collect(stickerId('SCO', String(i)))
    }
    expect(useAlbumStore.getState().getMissing('SCO')).toHaveLength(0)
  })

  it('returns empty array for unknown team', () => {
    expect(useAlbumStore.getState().getMissing('ZZZ')).toHaveLength(0)
  })
})

describe('resetAlbum', () => {
  it('clears all stickers', () => {
    const store = useAlbumStore.getState()
    store.collect('BRA_1')
    store.collect('ARG_1')
    store.collect('FWC_00')
    store.resetAlbum()
    const p = useAlbumStore.getState().getTotalProgress()
    expect(p.collected).toBe(0)
  })
})

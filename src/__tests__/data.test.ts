import {
  TEAMS,
  GROUPS,
  FWC_SECTION,
  CC_SECTION,
  TOTAL_STICKERS,
  getTeamsByGroup,
  getTeamByCode,
  GROUP_COLORS,
} from '@/data/teams'

describe('TEAMS data integrity', () => {
  it('has exactly 48 teams', () => {
    expect(TEAMS).toHaveLength(48)
  })

  it('every team has exactly 20 stickers', () => {
    for (const team of TEAMS) {
      expect(team.stickers).toHaveLength(20)
    }
  })

  it('every team sticker 1 is the badge', () => {
    for (const team of TEAMS) {
      const first = team.stickers[0]
      expect(first.number).toBe('1')
      expect(first.type).toBe('badge')
    }
  })

  it('every team sticker 2 is the team photo', () => {
    for (const team of TEAMS) {
      const second = team.stickers[1]
      expect(second.number).toBe('2')
      expect(second.type).toBe('photo')
    }
  })

  it('sticker numbers are sequential 1-20', () => {
    for (const team of TEAMS) {
      const numbers = team.stickers.map((s) => s.number)
      const expected = Array.from({ length: 20 }, (_, i) => String(i + 1))
      expect(numbers).toEqual(expected)
    }
  })

  it('all team codes are unique', () => {
    const codes = TEAMS.map((t) => t.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(TEAMS.length)
  })

  it('all team codes are uppercase 2-3 chars', () => {
    for (const team of TEAMS) {
      expect(team.code).toMatch(/^[A-Z]{2,3}$/)
    }
  })

  it('all flag codes are non-empty strings', () => {
    for (const team of TEAMS) {
      expect(team.flagCode).toBeTruthy()
      expect(typeof team.flagCode).toBe('string')
    }
  })

  it('all primary colors are valid hex or rgb', () => {
    for (const team of TEAMS) {
      expect(team.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('every team belongs to a valid group', () => {
    for (const team of TEAMS) {
      expect(GROUPS).toContain(team.group)
    }
  })

  it('each group has exactly 4 teams', () => {
    for (const group of GROUPS) {
      const teams = getTeamsByGroup(group)
      expect(teams).toHaveLength(4)
    }
  })

  it('all 12 groups exist (A-L)', () => {
    expect(GROUPS).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'])
  })

  it('all sticker labels are non-empty', () => {
    for (const team of TEAMS) {
      for (const sticker of team.stickers) {
        expect(sticker.label.trim()).not.toBe('')
      }
    }
  })

  it('player stickers (3-20) have type player', () => {
    for (const team of TEAMS) {
      const players = team.stickers.slice(2)
      for (const sticker of players) {
        expect(sticker.type).toBe('player')
      }
    }
  })
})

describe('FWC section', () => {
  it('has exactly 20 stickers', () => {
    expect(FWC_SECTION.stickers).toHaveLength(20)
  })

  it('starts with sticker 00 (abertura)', () => {
    expect(FWC_SECTION.stickers[0].number).toBe('00')
    expect(FWC_SECTION.stickers[0].label).toBeTruthy()
  })

  it('has stickers numbered 00 then 1-19', () => {
    const numbers = FWC_SECTION.stickers.map((s) => s.number)
    expect(numbers[0]).toBe('00')
    expect(numbers.slice(1)).toEqual(Array.from({ length: 19 }, (_, i) => String(i + 1)))
  })

  it('all sticker labels are non-empty', () => {
    for (const s of FWC_SECTION.stickers) {
      expect(s.label.trim()).not.toBe('')
    }
  })

  it('has code FWC', () => {
    expect(FWC_SECTION.code).toBe('FWC')
  })

  it('includes mascote, troféu and bola stickers', () => {
    const labels = FWC_SECTION.stickers.map((s) => s.label.toLowerCase())
    expect(labels.some((l) => l.includes('mascote'))).toBe(true)
    expect(labels.some((l) => l.includes('troféu') || l.includes('trofeu'))).toBe(true)
    expect(labels.some((l) => l.includes('bola'))).toBe(true)
  })
})

describe('Coca-Cola section', () => {
  it('has exactly 14 stickers', () => {
    expect(CC_SECTION.stickers).toHaveLength(14)
  })

  it('has code CC', () => {
    expect(CC_SECTION.code).toBe('CC')
  })

  it('sticker numbers are 1-14', () => {
    const numbers = CC_SECTION.stickers.map((s) => s.number)
    const expected = Array.from({ length: 14 }, (_, i) => String(i + 1))
    expect(numbers).toEqual(expected)
  })
})

describe('TOTAL_STICKERS', () => {
  it('equals 994 (48×20 + 20 FWC + 14 CC)', () => {
    expect(TOTAL_STICKERS).toBe(994)
  })
})

describe('getTeamByCode', () => {
  it('finds Brasil by BRA', () => {
    const team = getTeamByCode('BRA')
    expect(team).toBeDefined()
    expect(team?.name).toBe('Brasil')
  })

  it('finds Argentina by ARG', () => {
    const team = getTeamByCode('ARG')
    expect(team).toBeDefined()
    expect(team?.name).toBe('Argentina')
  })

  it('returns undefined for unknown code', () => {
    expect(getTeamByCode('ZZZ')).toBeUndefined()
  })
})

describe('GROUP_COLORS', () => {
  it('has a color for every group', () => {
    for (const group of GROUPS) {
      expect(GROUP_COLORS[group]).toBeTruthy()
    }
  })

  it('all colors are valid hex', () => {
    for (const color of Object.values(GROUP_COLORS)) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('Special teams', () => {
  it('Brasil is in Grupo C', () => {
    expect(getTeamByCode('BRA')?.group).toBe('C')
  })

  it('Argentina is in Grupo J', () => {
    expect(getTeamByCode('ARG')?.group).toBe('J')
  })

  it('Escócia uses gb-sct flag code', () => {
    expect(getTeamByCode('SCO')?.flagCode).toBe('gb-sct')
  })

  it('Inglaterra uses gb-eng flag code', () => {
    expect(getTeamByCode('ENG')?.flagCode).toBe('gb-eng')
  })

  it('Suíça uses ch flag code', () => {
    expect(getTeamByCode('SUI')?.flagCode).toBe('ch')
  })
})

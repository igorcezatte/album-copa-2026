import { buildPdfData, buildFullPdfData } from '@/utils/pdf'

// ── buildPdfData (v1, mantido para compatibilidade) ──────────────
describe('buildPdfData', () => {
  it('returns empty groups when no missing stickers', () => {
    const result = buildPdfData([])
    expect(result.groups).toHaveLength(0)
    expect(result.totalMissing).toBe(0)
  })

  it('calculates totalMissing correctly', () => {
    const result = buildPdfData([
      { teamName: 'Brasil', group: 'C', missing: ['3', '4', '5'] },
      { teamName: 'Argentina', group: 'J', missing: ['7'] },
    ])
    expect(result.totalMissing).toBe(4)
  })

  it('groups teams by group letter', () => {
    const result = buildPdfData([
      { teamName: 'Brasil', group: 'C', missing: ['3'] },
      { teamName: 'Marrocos', group: 'C', missing: ['5'] },
      { teamName: 'Argentina', group: 'J', missing: ['7'] },
    ])
    expect(result.groups).toHaveLength(2)
    const groupC = result.groups.find((g) => g.group === 'C')
    expect(groupC?.teams).toHaveLength(2)
  })

  it('sorts groups alphabetically', () => {
    const result = buildPdfData([
      { teamName: 'Argentina', group: 'J', missing: ['1'] },
      { teamName: 'Brasil', group: 'C', missing: ['1'] },
    ])
    expect(result.groups[0].group).toBe('C')
    expect(result.groups[1].group).toBe('J')
  })

  it('includes title and generated date', () => {
    const result = buildPdfData([])
    expect(result.title).toContain('Copa')
    expect(result.generatedAt).toBeTruthy()
  })

  it('each team entry has teamName and missing array', () => {
    const result = buildPdfData([
      { teamName: 'Brasil', group: 'C', missing: ['3', '7'] },
    ])
    const team = result.groups[0].teams[0]
    expect(team.teamName).toBe('Brasil')
    expect(team.missing).toEqual(['3', '7'])
  })
})

// ── buildFullPdfData (v2, uma página com todos os times) ─────────
describe('buildFullPdfData', () => {
  const allTeams = [
    { teamName: 'Brasil', group: 'C', primaryColor: '#009C3B', missing: ['3', '7'] },
    { teamName: 'Marrocos', group: 'C', primaryColor: '#C1272D', missing: [] },
    { teamName: 'Argentina', group: 'J', primaryColor: '#74ACDF', missing: ['5'] },
  ]

  it('includes all teams, not just those with missing stickers', () => {
    const result = buildFullPdfData(allTeams, [], { collected: 50, total: 60 })
    const allInResult = result.groups.flatMap((g) => g.teams)
    expect(allInResult).toHaveLength(3)
  })

  it('marks complete teams correctly', () => {
    const result = buildFullPdfData(allTeams, [], { collected: 50, total: 60 })
    const groupC = result.groups.find((g) => g.group === 'C')!
    const marrocos = groupC.teams.find((t) => t.teamName === 'Marrocos')!
    expect(marrocos.missing).toHaveLength(0)
  })

  it('counts completedTeams correctly', () => {
    const result = buildFullPdfData(allTeams, [], { collected: 50, total: 60 })
    expect(result.completedTeams).toBe(1)
  })

  it('counts totalMissing correctly', () => {
    const result = buildFullPdfData(allTeams, [], { collected: 50, total: 60 })
    expect(result.totalMissing).toBe(3)
  })

  it('includes special sections', () => {
    const specials = [{ name: 'Copa History', color: '#f5c42e', missing: ['1', '2'] }]
    const result = buildFullPdfData(allTeams, specials, { collected: 50, total: 60 })
    expect(result.specialSections).toHaveLength(1)
    expect(result.specialSections[0].name).toBe('Copa History')
  })

  it('sorts groups alphabetically', () => {
    const result = buildFullPdfData(allTeams, [], { collected: 50, total: 60 })
    expect(result.groups[0].group).toBe('C')
    expect(result.groups[1].group).toBe('J')
  })

  it('includes progress info', () => {
    const result = buildFullPdfData(allTeams, [], { collected: 50, total: 60 })
    expect(result.totalProgress.collected).toBe(50)
    expect(result.totalProgress.total).toBe(60)
  })
})

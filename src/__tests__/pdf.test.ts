import { buildPdfData } from '@/utils/pdf'

describe('buildPdfData', () => {
  it('returns empty groups when no missing stickers', () => {
    const result = buildPdfData([])
    expect(result.groups).toHaveLength(0)
    expect(result.totalMissing).toBe(0)
  })

  it('calculates totalMissing correctly', () => {
    const result = buildPdfData([
      { teamName: 'Brasil', group: 'C', missing: ['3', '4', '5'] },
      { teamName: 'Argentina', group: 'J', missing: ['7', '8'] },
    ])
    expect(result.totalMissing).toBe(5)
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

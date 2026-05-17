import { generateShareText } from '@/utils/share'

describe('generateShareText', () => {
  it('returns complete message when no missing stickers', () => {
    const text = generateShareText([])
    expect(text).toContain('completo')
  })

  it('includes total missing count', () => {
    const text = generateShareText([
      { teamName: 'Brasil', missing: ['3', '4', '5'] },
      { teamName: 'Argentina', missing: ['7'] },
    ])
    expect(text).toContain('4')
  })

  it('includes team name in output', () => {
    const text = generateShareText([
      { teamName: 'Brasil', missing: ['3', '7'] },
    ])
    expect(text).toContain('Brasil')
  })

  it('includes sticker numbers in output', () => {
    const text = generateShareText([
      { teamName: 'Brasil', missing: ['3', '7'] },
    ])
    expect(text).toContain('3')
    expect(text).toContain('7')
  })

  it('includes multiple teams', () => {
    const text = generateShareText([
      { teamName: 'Brasil', missing: ['3'] },
      { teamName: 'Argentina', missing: ['5'] },
    ])
    expect(text).toContain('Brasil')
    expect(text).toContain('Argentina')
  })

  it('includes app mention or context', () => {
    const text = generateShareText([{ teamName: 'Brasil', missing: ['1'] }])
    expect(text.length).toBeGreaterThan(20)
  })

  it('has a header line', () => {
    const text = generateShareText([{ teamName: 'Brasil', missing: ['3'] }])
    expect(text).toContain('Copa')
  })
})

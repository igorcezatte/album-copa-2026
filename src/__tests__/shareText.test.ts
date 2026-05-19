import { buildShareText } from '@/utils/shareText'

describe('buildShareText', () => {
  it('inclui título, progresso e URL', () => {
    const text = buildShareText({
      collected: 0,
      total: 994,
      teamsMissing: [],
      specialsMissing: [],
      duplicates: [],
    })
    expect(text).toContain('Álbum Copa 2026')
    expect(text).toContain('0/994')
    expect(text).toContain('0%')
    expect(text).toContain('meualbumcopa26.vercel.app')
  })

  it('calcula porcentagem corretamente', () => {
    const text = buildShareText({
      collected: 357,
      total: 993,
      teamsMissing: [],
      specialsMissing: [],
      duplicates: [],
    })
    expect(text).toContain('357/993')
    expect(text).toContain('36%')
  })

  it('lista times com faltantes', () => {
    const text = buildShareText({
      collected: 5,
      total: 994,
      teamsMissing: [
        { teamName: 'Brasil', missing: ['5', '8', '13'] },
        { teamName: 'México', missing: ['1'] },
      ],
      specialsMissing: [],
      duplicates: [],
    })
    expect(text).toContain('Brasil: 5, 8, 13')
    expect(text).toContain('México: 1')
  })

  it('inclui especiais (FWC, CC) na seção de faltantes', () => {
    const text = buildShareText({
      collected: 0,
      total: 994,
      teamsMissing: [],
      specialsMissing: [
        { name: 'Copa History', icon: '🏆', missing: ['1', '19'] },
        { name: 'Coca-Cola', icon: '🥤', missing: ['5'] },
      ],
      duplicates: [],
    })
    expect(text).toContain('Copa History: 1, 19')
    expect(text).toContain('Coca-Cola: 5')
  })

  it('lista repetidas com contagem', () => {
    const text = buildShareText({
      collected: 50,
      total: 994,
      teamsMissing: [],
      specialsMissing: [],
      duplicates: [
        { teamName: 'Brasil', number: '5', extras: 2 },
        { teamName: 'México', number: '10', extras: 1 },
      ],
    })
    expect(text).toContain('Brasil #5 ×2')
    expect(text).toContain('México #10') // sem ×1 (apenas 1 extra = não mostra)
    expect(text).not.toContain('México #10 ×1')
  })

  it('mostra "Álbum completo!" quando não há faltantes', () => {
    const text = buildShareText({
      collected: 994,
      total: 994,
      teamsMissing: [],
      specialsMissing: [],
      duplicates: [],
    })
    expect(text).toContain('Álbum completo!')
    expect(text).not.toContain('Faltam')
  })

  it('inclui emoji de bandeira se fornecido', () => {
    const text = buildShareText({
      collected: 0,
      total: 994,
      teamsMissing: [
        { teamName: 'Brasil', flagEmoji: '🇧🇷', missing: ['1'] },
      ],
      specialsMissing: [],
      duplicates: [],
    })
    expect(text).toContain('🇧🇷 Brasil')
  })

  it('totaliza faltantes incluindo especiais', () => {
    const text = buildShareText({
      collected: 0,
      total: 994,
      teamsMissing: [{ teamName: 'Brasil', missing: ['1', '2', '3'] }],
      specialsMissing: [{ name: 'CC', missing: ['1', '2'] }],
      duplicates: [],
    })
    expect(text).toContain('Faltam 5') // 3 + 2
  })

  it('totaliza repetidas somando todos os extras', () => {
    const text = buildShareText({
      collected: 50,
      total: 994,
      teamsMissing: [],
      specialsMissing: [],
      duplicates: [
        { teamName: 'Brasil', number: '5', extras: 2 },
        { teamName: 'México', number: '10', extras: 3 },
      ],
    })
    expect(text).toContain('Repetidas 5')
  })

  it('omite seções vazias mantendo layout limpo', () => {
    const text = buildShareText({
      collected: 100,
      total: 994,
      teamsMissing: [],
      specialsMissing: [],
      duplicates: [],
    })
    expect(text).not.toContain('Faltam')
    expect(text).not.toContain('Repetidas')
  })

  it('ignora times com missing vazio na lista', () => {
    const text = buildShareText({
      collected: 0,
      total: 994,
      teamsMissing: [
        { teamName: 'Brasil', missing: ['1'] },
        { teamName: 'México', missing: [] },
      ],
      specialsMissing: [],
      duplicates: [],
    })
    expect(text).toContain('Brasil')
    expect(text).not.toContain('• México:')
  })
})

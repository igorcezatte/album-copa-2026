import {
  buildShareText,
  buildTextDuplicates,
  type StickerResolver,
} from '@/utils/shareText'

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

describe('buildTextDuplicates', () => {
  const resolver: StickerResolver = (teamCode, number) => {
    if (teamCode === 'BRA') return { teamName: 'Brasil', label: number }
    if (teamCode === 'ARG') return { teamName: 'Argentina', label: number }
    if (teamCode === 'FWC') return { teamName: 'Copa History', label: `FWC${number}` }
    if (teamCode === 'CC') return { teamName: 'Coca-Cola', label: `CC${number}` }
    return null
  }

  it('mapeia repetidas de times normais', () => {
    const res = buildTextDuplicates([{ id: 'BRA_5', quantity: 2 }], resolver)
    expect(res).toEqual([{ teamName: 'Brasil', number: '5', extras: 2 }])
  })

  it('regression: inclui FWC nas repetidas (antes sumia)', () => {
    const res = buildTextDuplicates([{ id: 'FWC_1', quantity: 1 }], resolver)
    expect(res).toEqual([{ teamName: 'Copa History', number: 'FWC1', extras: 1 }])
  })

  it('regression: inclui CC nas repetidas (antes sumia)', () => {
    const res = buildTextDuplicates([{ id: 'CC_3', quantity: 2 }], resolver)
    expect(res).toEqual([{ teamName: 'Coca-Cola', number: 'CC3', extras: 2 }])
  })

  it('regression: total agrega time + FWC + CC corretamente', () => {
    // Cenario do bug reportado: 27 totais (25 time + 2 FWC/CC), texto mostrava 25
    const raw = [
      { id: 'BRA_5', quantity: 25 },
      { id: 'FWC_1', quantity: 1 },
      { id: 'CC_3', quantity: 1 },
    ]
    const res = buildTextDuplicates(raw, resolver)
    const total = res.reduce((acc, d) => acc + d.extras, 0)
    expect(total).toBe(27)

    const text = buildShareText({
      collected: 100,
      total: 994,
      teamsMissing: [],
      specialsMissing: [],
      duplicates: res,
    })
    expect(text).toContain('Repetidas 27')
  })

  it('descarta entries com quantity < 1', () => {
    const res = buildTextDuplicates(
      [
        { id: 'BRA_5', quantity: 0 },
        { id: 'BRA_6', quantity: 1 },
      ],
      resolver
    )
    expect(res).toHaveLength(1)
  })

  it('descarta stickers desconhecidas (resolver retorna null)', () => {
    const res = buildTextDuplicates([{ id: 'UNKNOWN_1', quantity: 5 }], resolver)
    expect(res).toEqual([])
  })

  it('preserva numero do sticker quando contem underscore', () => {
    // Edge case: split('_') com numParts.join('_') preserva 'FWC_1_2'
    const res = buildTextDuplicates([{ id: 'BRA_1_a', quantity: 1 }], resolver)
    expect(res[0].number).toBe('1_a')
  })
})

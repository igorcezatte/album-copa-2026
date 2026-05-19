import {
  parseQuickNumbers,
  parsePackInput,
  itemsToCounts,
  getMaxNumber,
} from '@/utils/quickAdd'

describe('getMaxNumber', () => {
  it('retorna 20 para times normais', () => {
    expect(getMaxNumber('BRA')).toBe(20)
    expect(getMaxNumber('MEX')).toBe(20)
  })

  it('retorna 19 para FWC e 14 para CC', () => {
    expect(getMaxNumber('FWC')).toBe(19)
    expect(getMaxNumber('CC')).toBe(14)
  })

  it('retorna null para código inválido', () => {
    expect(getMaxNumber('XYZ')).toBe(null)
  })
})

describe('parseQuickNumbers', () => {
  it('aceita números separados por espaço', () => {
    const r = parseQuickNumbers('5 7 13', 'BRA')
    expect(r.items).toEqual([
      { teamCode: 'BRA', number: '5' },
      { teamCode: 'BRA', number: '7' },
      { teamCode: 'BRA', number: '13' },
    ])
    expect(r.errors).toEqual([])
  })

  it('aceita números separados por vírgula', () => {
    const r = parseQuickNumbers('5, 7, 13', 'BRA')
    expect(r.items).toHaveLength(3)
  })

  it('aceita números separados por nova linha', () => {
    const r = parseQuickNumbers('5\n7\n13', 'BRA')
    expect(r.items).toHaveLength(3)
  })

  it('aceita números com mistura caótica de separadores', () => {
    const r = parseQuickNumbers('5,7  13;,\n 2', 'BRA')
    expect(r.items).toHaveLength(4)
  })

  it('preserva repetições (mesmo número 2× = 2 items)', () => {
    const r = parseQuickNumbers('5 5 5', 'BRA')
    expect(r.items).toHaveLength(3)
    expect(r.items.every((i) => i.number === '5')).toBe(true)
  })

  it('rejeita número fora do range com erro descritivo', () => {
    const r = parseQuickNumbers('21', 'BRA')
    expect(r.items).toEqual([])
    expect(r.errors[0]).toMatch(/#21/)
    expect(r.errors[0]).toMatch(/1.20/)
  })

  it('rejeita 0', () => {
    const r = parseQuickNumbers('0', 'BRA')
    expect(r.items).toEqual([])
    expect(r.errors).toHaveLength(1)
  })

  it('rejeita time desconhecido', () => {
    const r = parseQuickNumbers('5', 'XYZ')
    expect(r.errors[0]).toMatch(/desconhecido/)
  })

  it('FWC aceita 1-19 mas rejeita 20', () => {
    expect(parseQuickNumbers('19', 'FWC').items).toHaveLength(1)
    expect(parseQuickNumbers('20', 'FWC').items).toEqual([])
  })

  it('CC aceita 1-14 mas rejeita 15', () => {
    expect(parseQuickNumbers('14', 'CC').items).toHaveLength(1)
    expect(parseQuickNumbers('15', 'CC').items).toEqual([])
  })

  it('aceita input vazio sem erros', () => {
    expect(parseQuickNumbers('', 'BRA')).toEqual({ items: [], errors: [] })
  })

  it('ignora texto não-numérico misturado', () => {
    const r = parseQuickNumbers('abc 5 def 7', 'BRA')
    expect(r.items).toHaveLength(2)
  })
})

describe('parsePackInput', () => {
  it('aceita times separados por vírgula', () => {
    const r = parsePackInput('BRA 5, MEX 12, FWC 19')
    expect(r.items).toEqual([
      { teamCode: 'BRA', number: '5' },
      { teamCode: 'MEX', number: '12' },
      { teamCode: 'FWC', number: '19' },
    ])
  })

  it('herda último time para números subsequentes', () => {
    const r = parsePackInput('BRA 5 7 12, MEX 1 3')
    expect(r.items).toEqual([
      { teamCode: 'BRA', number: '5' },
      { teamCode: 'BRA', number: '7' },
      { teamCode: 'BRA', number: '12' },
      { teamCode: 'MEX', number: '1' },
      { teamCode: 'MEX', number: '3' },
    ])
  })

  it('aceita minúsculas e maiúsculas', () => {
    const r = parsePackInput('bra 5 mex 12')
    expect(r.items).toEqual([
      { teamCode: 'BRA', number: '5' },
      { teamCode: 'MEX', number: '12' },
    ])
  })

  it('aceita sem espaço entre código e número', () => {
    const r = parsePackInput('BRA5 MEX12 fwc19')
    expect(r.items).toHaveLength(3)
    expect(r.items[2]).toEqual({ teamCode: 'FWC', number: '19' })
  })

  it('aceita CC (seção especial)', () => {
    const r = parsePackInput('CC 5, CC 14')
    expect(r.items).toEqual([
      { teamCode: 'CC', number: '5' },
      { teamCode: 'CC', number: '14' },
    ])
  })

  it('emite erro para código inválido mas continua', () => {
    const r = parsePackInput('BRA 5, XYZ 3, MEX 12')
    expect(r.items).toEqual([
      { teamCode: 'BRA', number: '5' },
      { teamCode: 'MEX', number: '12' },
    ])
    expect(r.errors).toHaveLength(2) // XYZ inválido + 3 sem time
  })

  it('emite erro pra número antes do primeiro time', () => {
    const r = parsePackInput('5 BRA 12')
    expect(r.errors[0]).toMatch(/precisa de um time/)
    expect(r.items).toEqual([{ teamCode: 'BRA', number: '12' }])
  })

  it('emite erro para número fora do range', () => {
    const r = parsePackInput('BRA 25')
    expect(r.items).toEqual([])
    expect(r.errors[0]).toMatch(/BRA #25/)
  })

  it('aceita repetidas (mesmo sticker 2x)', () => {
    const r = parsePackInput('BRA 5 5 5')
    expect(r.items).toHaveLength(3)
  })

  it('input vazio retorna sem erros', () => {
    expect(parsePackInput('')).toEqual({ items: [], errors: [] })
  })

  it('aceita mistura caótica de separadores', () => {
    const r = parsePackInput('BRA-5; MEX:12, FWC.19\nBRA 7')
    expect(r.items).toHaveLength(4)
  })
})

describe('itemsToCounts', () => {
  it('conta ocorrências por sticker_id', () => {
    const counts = itemsToCounts([
      { teamCode: 'BRA', number: '5' },
      { teamCode: 'BRA', number: '5' },
      { teamCode: 'BRA', number: '7' },
      { teamCode: 'MEX', number: '12' },
    ])
    expect(counts.get('BRA_5')).toBe(2)
    expect(counts.get('BRA_7')).toBe(1)
    expect(counts.get('MEX_12')).toBe(1)
    expect(counts.size).toBe(3)
  })

  it('retorna map vazio pra lista vazia', () => {
    expect(itemsToCounts([]).size).toBe(0)
  })
})

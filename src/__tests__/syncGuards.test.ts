import {
  isCatastrophicShrink,
  isSignificantDivergence,
} from '@/utils/syncGuards'

describe('isCatastrophicShrink', () => {
  it('retorna false quando current é pequeno (< 20)', () => {
    expect(isCatastrophicShrink(0, 0)).toBe(false)
    expect(isCatastrophicShrink(10, 0)).toBe(false)
    expect(isCatastrophicShrink(19, 0)).toBe(false)
  })

  it('retorna true quando current >= 20 e incoming < 50% de current', () => {
    expect(isCatastrophicShrink(20, 9)).toBe(true)
    expect(isCatastrophicShrink(220, 76)).toBe(true) // o caso real do usuário
    expect(isCatastrophicShrink(100, 0)).toBe(true)
  })

  it('retorna false quando incoming >= 50% de current', () => {
    expect(isCatastrophicShrink(220, 110)).toBe(false)
    expect(isCatastrophicShrink(220, 200)).toBe(false)
    expect(isCatastrophicShrink(220, 219)).toBe(false)
    expect(isCatastrophicShrink(220, 220)).toBe(false)
    expect(isCatastrophicShrink(220, 300)).toBe(false) // crescimento sempre ok
  })

  it('retorna false no edge case current == 20 e incoming == 10 (exatamente 50%)', () => {
    expect(isCatastrophicShrink(20, 10)).toBe(false)
  })

  it('previne payload [] catastrófico em conta com dados', () => {
    expect(isCatastrophicShrink(100, 0)).toBe(true)
    expect(isCatastrophicShrink(50, 0)).toBe(true)
  })
})

describe('isSignificantDivergence', () => {
  it('retorna false quando ambos vazios ou iguais', () => {
    expect(isSignificantDivergence(0, 0)).toBe(false)
    expect(isSignificantDivergence(100, 100)).toBe(false)
  })

  it('considera um lado vazio só se o outro for >= 10', () => {
    expect(isSignificantDivergence(0, 5)).toBe(false) // tem pouco no remoto
    expect(isSignificantDivergence(5, 0)).toBe(false)
    expect(isSignificantDivergence(0, 10)).toBe(true)
    expect(isSignificantDivergence(0, 220)).toBe(true)
    expect(isSignificantDivergence(220, 0)).toBe(true)
  })

  describe('SHRINK (remote < local) — sensível, qualquer perda visível conta', () => {
    it('dispara pra perda mínima de 2 stickers se local >= 5', () => {
      expect(isSignificantDivergence(5, 3)).toBe(true)
      expect(isSignificantDivergence(100, 98)).toBe(true)
      expect(isSignificantDivergence(1000, 998)).toBe(true)
    })

    it('regression: 27→25 (caso do bug reportado) dispara', () => {
      // Usuária adicionou 2 CC sem login e o sync subsequente apagava sem aviso
      expect(isSignificantDivergence(27, 25)).toBe(true)
    })

    it('regression: 1000→980 agora dispara (antes era benigno)', () => {
      // Antes diff 20 / 2% não disparava — agora sim, qualquer perda em álbum ja iniciado conta
      expect(isSignificantDivergence(1000, 980)).toBe(true)
    })

    it('caso real 220→76 dispara', () => {
      expect(isSignificantDivergence(220, 76)).toBe(true)
    })

    it('não dispara pra perda de 1 sticker (provavelmente desmarcação intencional)', () => {
      expect(isSignificantDivergence(100, 99)).toBe(false)
      expect(isSignificantDivergence(50, 49)).toBe(false)
    })

    it('não dispara em locais muito pequenos (usuário começando)', () => {
      expect(isSignificantDivergence(4, 0)).toBe(false) // local < SHRINK_MIN_LOCAL
      expect(isSignificantDivergence(3, 1)).toBe(false)
    })

    it('dispara via ratio (5%) mesmo quando loss < SHRINK_MIN_LOSS', () => {
      // local=5, perda=1: 1/5 = 20% > 5% → dispara (regra é OR, não AND)
      expect(isSignificantDivergence(5, 4)).toBe(true)
      // local=20, perda=2: 2/20 = 10% e loss >= 2 → dispara
      expect(isSignificantDivergence(20, 18)).toBe(true)
      // local=100, perda=1: 1% < 5% E loss < 2 → não dispara
      expect(isSignificantDivergence(100, 99)).toBe(false)
    })
  })

  describe('GROW (remote > local) — permissivo, mantém threshold original', () => {
    it('não dispara pra crescimentos pequenos', () => {
      expect(isSignificantDivergence(100, 105)).toBe(false) // diff 5
      expect(isSignificantDivergence(100, 109)).toBe(false) // diff 9
    })

    it('não dispara quando a razão é pequena mesmo com diff alto absoluto', () => {
      expect(isSignificantDivergence(980, 1000)).toBe(false) // 2% diff
    })

    it('dispara quando diff >= 10 E ratio >= 20%', () => {
      expect(isSignificantDivergence(76, 220)).toBe(true) // simétrico do caso real
      expect(isSignificantDivergence(50, 100)).toBe(true)
    })
  })
})

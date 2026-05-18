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
  it('retorna false quando ambos vazios', () => {
    expect(isSignificantDivergence(0, 0)).toBe(false)
  })

  it('retorna false para diferenças pequenas absolutas', () => {
    expect(isSignificantDivergence(100, 105)).toBe(false) // diff 5
    expect(isSignificantDivergence(100, 95)).toBe(false) // diff 5
    expect(isSignificantDivergence(100, 91)).toBe(false) // diff 9
  })

  it('retorna false quando a razão é pequena mesmo com diff alto absoluto', () => {
    expect(isSignificantDivergence(1000, 980)).toBe(false) // 2% diff
    expect(isSignificantDivergence(500, 495)).toBe(false)
  })

  it('retorna true para divergência significativa (diff >= 10 E ratio >= 20%)', () => {
    expect(isSignificantDivergence(220, 76)).toBe(true) // caso real do usuário
    expect(isSignificantDivergence(76, 220)).toBe(true) // simetria
    expect(isSignificantDivergence(100, 50)).toBe(true)
    expect(isSignificantDivergence(50, 100)).toBe(true)
  })

  it('considera um lado vazio só se o outro for >= 10', () => {
    expect(isSignificantDivergence(0, 5)).toBe(false) // tem pouco no remoto
    expect(isSignificantDivergence(5, 0)).toBe(false)
    expect(isSignificantDivergence(0, 10)).toBe(true)
    expect(isSignificantDivergence(0, 220)).toBe(true)
    expect(isSignificantDivergence(220, 0)).toBe(true)
  })

  it('não dispara para divergência alta absoluta mas relativa baixa', () => {
    expect(isSignificantDivergence(1000, 950)).toBe(false) // diff 50, ratio 5%
  })
})

import { relLuminance, readableTextOn, accentOn } from '@/lib/teamColor'

describe('relLuminance', () => {
  it('preto = 0, branco = 1', () => {
    expect(relLuminance('#000000')).toBeCloseTo(0)
    expect(relLuminance('#ffffff')).toBeCloseTo(1)
  })
})

describe('readableTextOn (texto sobre fundo da cor)', () => {
  it('texto branco sobre o preto da Alemanha', () => {
    expect(readableTextOn('#000000')).toBe('#ffffff')
  })

  it('texto escuro sobre amarelo claro (FWC)', () => {
    expect(readableTextOn('#f5c42e')).toBe('#0a0f1c')
  })

  it('texto branco sobre o vermelho da Coca-Cola (CC)', () => {
    expect(readableTextOn('#e8222a')).toBe('#ffffff')
  })
})

describe('accentOn (cor como texto sobre fundo escuro do app)', () => {
  it('clareia o preto da Alemanha pra um neutro legível', () => {
    expect(accentOn('#000000')).toBe('#d4d4d8')
  })

  it('mantém cores vivas intactas', () => {
    expect(accentOn('#f5c42e')).toBe('#f5c42e')
    expect(accentOn('#e8222a')).toBe('#e8222a')
  })
})

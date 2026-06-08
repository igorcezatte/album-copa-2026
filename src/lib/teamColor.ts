/**
 * Helpers de contraste para a cor do time.
 *
 * Alguns times têm cor muito escura (Alemanha = #000000). Usar essa cor crua
 * como texto sobre o fundo escuro do app, ou pôr texto preto sobre ela como
 * fundo, some. Estes helpers escolhem um valor legível em cada caso.
 */

/** Luminância relativa perceptual (0 = preto, 1 = branco). */
export function relLuminance(hex: string): number {
  const h = hex.replace('#', '')
  if (h.length < 6) return 0
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Cor de TEXTO a usar EM CIMA de `hex` como fundo sólido.
 * Fundo claro → texto escuro; fundo escuro → texto branco.
 */
export function readableTextOn(hex: string): string {
  return relLuminance(hex) > 0.45 ? '#0a0f1c' : '#ffffff'
}

/**
 * Cor do time para usar como PRIMEIRO PLANO (texto/ícone) sobre o fundo
 * escuro do app. Se for escura demais pra ler, cai num neutro claro.
 */
export function accentOn(hex: string): string {
  return relLuminance(hex) < 0.16 ? '#d4d4d8' : hex
}

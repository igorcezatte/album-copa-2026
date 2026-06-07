/**
 * Feedback tátil via navigator.vibrate.
 *
 * Independente do toggle de som: tato é outro sentido. E já é um no-op
 * silencioso onde não há suporte — iOS Safari não implementa a Vibration API,
 * Android/Chrome sim. Por isso não há "haptics enabled" pra desligar: onde
 * funciona, é sutil; onde não funciona, nem acontece.
 */

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return
  if (typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Alguns navegadores lançam se chamado fora de um user gesture — ignora.
  }
}

/** Toque curto ao marcar uma figurinha. */
export function vibrateTap(): void {
  vibrate(10)
}

/** Duplo-toque ao adicionar uma repetida. */
export function vibrateDouble(): void {
  vibrate([10, 40, 10])
}

/** Padrão de sucesso ao completar um time/seção (usado pelo overlay). */
export function vibrateSuccess(): void {
  vibrate([0, 40, 60, 40, 60, 90])
}

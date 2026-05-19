import { redirect } from 'next/navigation'

// /faltantes foi consolidado em /colecao com pill switcher.
// Mantém URL antiga funcionando pra deep links existentes.
export default function FaltantesPage() {
  redirect('/colecao')
}

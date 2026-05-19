import { redirect } from 'next/navigation'

// /repetidas foi consolidado em /colecao com pill switcher.
// Mantém URL antiga funcionando pra deep links existentes.
export default function RepetidasPage() {
  redirect('/colecao')
}

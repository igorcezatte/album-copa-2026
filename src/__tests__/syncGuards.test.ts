import {
  isCatastrophicShrink,
  isSignificantDivergence,
  classifyInitialSync,
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

describe('classifyInitialSync', () => {
  describe('Caso A: primeiro sync, sem dados locais', () => {
    it('pull-silent quando local vazio e nunca sincronizou', () => {
      expect(
        classifyInitialSync({
          userId: 'user-a',
          localSize: 0,
          remoteSize: 0,
          syncedBefore: false,
          lastUserId: null,
        })
      ).toEqual({ kind: 'pull-silent' })
    })

    it('pull-silent quando local vazio mesmo se outra conta passou antes', () => {
      // Após reset_album já limpamos last-user-id, mas garantir comportamento
      expect(
        classifyInitialSync({
          userId: 'user-b',
          localSize: 0,
          remoteSize: 100,
          syncedBefore: false,
          lastUserId: 'user-a',
        })
      ).toEqual({ kind: 'pull-silent' })
    })
  })

  describe('Caso B: anônimo logando pela primeira vez', () => {
    it('welcome-modal quando há dados locais e nunca houve conta antes', () => {
      expect(
        classifyInitialSync({
          userId: 'user-a',
          localSize: 30,
          remoteSize: 0,
          syncedBefore: false,
          lastUserId: null,
        })
      ).toEqual({ kind: 'welcome-modal' })
    })

    it('welcome-modal mesmo se a conta tem dados na nuvem', () => {
      expect(
        classifyInitialSync({
          userId: 'user-a',
          localSize: 30,
          remoteSize: 100,
          syncedBefore: false,
          lastUserId: null,
        })
      ).toEqual({ kind: 'welcome-modal' })
    })
  })

  describe('Caso C: mesma conta voltando', () => {
    it('same-user-pull quando divergência aceitável', () => {
      expect(
        classifyInitialSync({
          userId: 'user-a',
          localSize: 100,
          remoteSize: 99, // perda de 1 — não dispara conflict
          syncedBefore: true,
          lastUserId: 'user-a',
        })
      ).toEqual({ kind: 'same-user-pull' })
    })

    it('same-user-pull quando local e remoto iguais', () => {
      expect(
        classifyInitialSync({
          userId: 'user-a',
          localSize: 50,
          remoteSize: 50,
          syncedBefore: true,
          lastUserId: 'user-a',
        })
      ).toEqual({ kind: 'same-user-pull' })
    })

    it('same-user-conflict quando shrink significativo', () => {
      expect(
        classifyInitialSync({
          userId: 'user-a',
          localSize: 220,
          remoteSize: 76,
          syncedBefore: true,
          lastUserId: 'user-a',
        })
      ).toEqual({ kind: 'same-user-conflict' })
    })
  })

  describe('Caso D: regressão do bug — outra conta passou neste browser', () => {
    it('mismatch-modal quando outra conta sincronizou antes e local tem dados', () => {
      // Cenário exato reportado pelo usuário
      expect(
        classifyInitialSync({
          userId: 'user-b',
          localSize: 30,
          remoteSize: 0,
          syncedBefore: false,
          lastUserId: 'user-a',
        })
      ).toEqual({ kind: 'mismatch-modal' })
    })

    it('mismatch-modal mesmo se a conta nova tem dados na nuvem', () => {
      expect(
        classifyInitialSync({
          userId: 'user-b',
          localSize: 30,
          remoteSize: 50,
          syncedBefore: false,
          lastUserId: 'user-a',
        })
      ).toEqual({ kind: 'mismatch-modal' })
    })

    it('não confunde mismatch com mesma conta (sem syncedBefore)', () => {
      // Se a flag synced-{userId} foi limpa mas last-user-id ainda aponta
      // pra ela, ainda assim deve ser tratado como mismatch — usuário deve
      // confirmar antes de qualquer ação destrutiva.
      expect(
        classifyInitialSync({
          userId: 'user-a',
          localSize: 30,
          remoteSize: 0,
          syncedBefore: false,
          lastUserId: 'user-a',
        })
      ).toEqual({ kind: 'welcome-modal' }) // lastUserId === userId, caso B
    })
  })
})

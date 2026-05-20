import { buildUpsertsAndRemovals } from '@/utils/syncDiff'

const USER = 'user-abc'
const NOW = '2026-05-19T10:00:00.000Z'
const PAST = '2026-01-01T08:00:00.000Z'

function mk(qty: Array<[string, number]>): Map<string, number> {
  return new Map(qty)
}
function mkCollected(rows: Array<[string, string]>): Map<string, string> {
  return new Map(rows)
}

describe('buildUpsertsAndRemovals', () => {
  it('REGRESSAO: batch misto (novo + update) preenche collected_at em TODA row', () => {
    // Esse foi o bug catastrofico: collected_at era omitido em updates e o
    // Postgrest gerava SQL com NULL, violando NOT NULL. Resultado: o batch
    // inteiro falhava 500 e nada salvava — usuarios viam local=608 / banco=525
    // com o modal de divergencia voltando a cada F5.
    const { upserts } = buildUpsertsAndRemovals({
      current: mk([['BRA_1', 1]]),
      currentCollectedAt: mkCollected([['BRA_1', PAST]]),
      incoming: mk([
        ['BRA_1', 2], // update existente
        ['MEX_5', 1], // novo
      ]),
      userId: USER,
      now: NOW,
    })

    expect(upserts).toHaveLength(2)
    // INVARIANTE: nenhuma row pode ter collected_at faltando ou null
    for (const row of upserts) {
      expect(row.collected_at).toBeTruthy()
      expect(typeof row.collected_at).toBe('string')
    }
  })

  it('update preserva collected_at original', () => {
    const { upserts } = buildUpsertsAndRemovals({
      current: mk([['BRA_1', 1]]),
      currentCollectedAt: mkCollected([['BRA_1', PAST]]),
      incoming: mk([['BRA_1', 3]]),
      userId: USER,
      now: NOW,
    })

    expect(upserts).toEqual([
      {
        user_id: USER,
        sticker_id: 'BRA_1',
        quantity: 3,
        updated_at: NOW,
        removed_at: null,
        collected_at: PAST,
      },
    ])
  })

  it('insert novo usa now em collected_at', () => {
    const { upserts } = buildUpsertsAndRemovals({
      current: mk([]),
      currentCollectedAt: mkCollected([]),
      incoming: mk([['MEX_5', 1]]),
      userId: USER,
      now: NOW,
    })

    expect(upserts).toEqual([
      {
        user_id: USER,
        sticker_id: 'MEX_5',
        quantity: 1,
        updated_at: NOW,
        removed_at: null,
        collected_at: NOW,
      },
    ])
  })

  it('re-coletar sticker soft-deletado (ausente em current) trata como novo', () => {
    // Sticker existe no banco mas com removed_at NOT NULL — o SELECT do route
    // filtra por removed_at IS NULL, entao essa row nao aparece em current.
    // O upsert vai reativar (removed_at=null) e o collected_at fica como now.
    const { upserts } = buildUpsertsAndRemovals({
      current: mk([]),
      currentCollectedAt: mkCollected([]),
      incoming: mk([['ARG_3', 2]]),
      userId: USER,
      now: NOW,
    })

    expect(upserts[0].collected_at).toBe(NOW)
    expect(upserts[0].removed_at).toBeNull()
    expect(upserts[0].quantity).toBe(2)
  })

  it('sticker em current ausente em incoming entra em removals', () => {
    const { upserts, removals } = buildUpsertsAndRemovals({
      current: mk([
        ['BRA_1', 1],
        ['MEX_5', 1],
      ]),
      currentCollectedAt: mkCollected([
        ['BRA_1', PAST],
        ['MEX_5', PAST],
      ]),
      incoming: mk([['BRA_1', 1]]),
      userId: USER,
      now: NOW,
    })

    expect(removals).toEqual(['MEX_5'])
    expect(upserts).toEqual([]) // BRA_1 sem mudanca, MEX_5 vai como removal
  })

  it('quantity igual entre current e incoming NAO entra em upserts', () => {
    const { upserts } = buildUpsertsAndRemovals({
      current: mk([['BRA_1', 2]]),
      currentCollectedAt: mkCollected([['BRA_1', PAST]]),
      incoming: mk([['BRA_1', 2]]),
      userId: USER,
      now: NOW,
    })

    expect(upserts).toEqual([])
  })

  it('payload vazio com banco populado gera so removals', () => {
    const { upserts, removals } = buildUpsertsAndRemovals({
      current: mk([
        ['BRA_1', 1],
        ['MEX_5', 1],
      ]),
      currentCollectedAt: mkCollected([
        ['BRA_1', PAST],
        ['MEX_5', PAST],
      ]),
      incoming: mk([]),
      userId: USER,
      now: NOW,
    })

    expect(upserts).toEqual([])
    expect(new Set(removals)).toEqual(new Set(['BRA_1', 'MEX_5']))
  })

  it('user_id eh propagado em toda row', () => {
    const { upserts } = buildUpsertsAndRemovals({
      current: mk([['BRA_1', 1]]),
      currentCollectedAt: mkCollected([['BRA_1', PAST]]),
      incoming: mk([
        ['BRA_1', 2],
        ['MEX_5', 1],
      ]),
      userId: 'specific-user-xyz',
      now: NOW,
    })

    for (const row of upserts) {
      expect(row.user_id).toBe('specific-user-xyz')
    }
  })
})

export interface AdminStats {
  /** Quantos perfis existem no sistema */
  totalUsers: number
  /** Quantos perfis foram vistos nos últimos 7 dias */
  activeUsersLast7d: number
  /** Quantos perfis foram vistos nas últimas 24h */
  activeUsersLast24h: number
  /** Soma total de figurinhas coletadas (ativas) entre todos os usuários */
  totalStickersCollected: number
  /** Média de figurinhas por usuário ativo nos últimos 7 dias */
  avgStickersPerActiveUser: number
  /** Quantidade de usuários que ja completaram o álbum */
  usersCompleted: number
}

export interface AdminUserSummary {
  userId: string
  email: string | null
  name: string | null
  imageUrl: string | null
  firstSeenAt: string
  lastSeenAt: string
  stickerCount: number
}

export interface AdminUsersList {
  users: AdminUserSummary[]
  total: number
  page: number
  pageSize: number
}

export interface AdminUserDetail extends AdminUserSummary {
  stickers: Array<{
    sticker_id: string
    quantity: number
    collected_at: string
  }>
  totalCopies: number
}

import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authenticateLocal } from './localAuth'
import { hit } from './rateLimit'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'local',
      name: 'Apelido e senha',
      credentials: {
        username: { label: 'Apelido', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(creds) {
        if (!creds?.username || !creds?.password) return null

        // Rate limit por apelido pra desestimular brute-force. A chave usa
        // o nome cru lower-cased — não chamamos validateUsername aqui pra
        // não vazar se o apelido tem chars inválidos (já recusa lá dentro).
        const key = `local-login:${String(creds.username).toLowerCase()}`
        const rl = hit(key)
        if (!rl.allowed) return null

        const account = await authenticateLocal(creds.username, creds.password)
        if (!account) return null
        return { id: account.user_id, name: account.username }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, account, user }) {
      // Primeira ida com `account` definido (login): grava o subject.
      // Google → providerAccountId. Local → user.id (UUID do banco).
      if (account?.provider === 'google') {
        token.sub = account.providerAccountId
      } else if (account?.provider === 'local' && user?.id) {
        token.sub = user.id
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub
      return session
    },
  },
  pages: {
    signIn: '/',  // redireciona para home em vez de página de login dedicada
  },
}

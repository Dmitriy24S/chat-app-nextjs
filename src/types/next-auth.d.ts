import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

type UserIdType = string

declare module 'next-auth/jwt' {
  interface JWT {
    id: UserIdType
  }
}

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: UserIdType
    }
  }
}

import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body)
    console.log('idToAdd', idToAdd)

    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    // verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )

    if (isAlreadyFriends) {
      return new Response('Already friends', { status: 400 })
    }

    console.log('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)

    // verify that the user has a pending friend request to accept
    const hasPendingFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    )

    if (!hasPendingFriendRequest) {
      return new Response('No pending friend request', { status: 400 })
    }

    console.log('hasPendingFriendRequest', hasPendingFriendRequest)

    await db.sadd(`user:${session.user.id}:friends`, idToAdd)
    await db.sadd(`user:${idToAdd}:friends`, session.user.id)
    // await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id)
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)

    return new Response('OK') // otherwise error 500 response
  } catch (error) {
    console.log(error)

    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }

    return new Response('Invalid request', { status: 400 })
  }
}

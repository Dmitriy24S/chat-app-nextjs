import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { addFriendValidator } from '@/lib/validations/add-friend'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email: emailToAdd } = addFriendValidator.parse(body.email)
    console.log('emailToAdd', emailToAdd)

    const RESTResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: 'no-store',
      }
    )

    const data = (await RESTResponse.json()) as { result: string }
    console.log('data:', data)

    const idToAdd = data.result
    console.log('idToAdd:', idToAdd)

    if (!idToAdd) {
      return new Response('User not found', { status: 400 })
    }

    const session = await getServerSession(authOptions)
    console.log('session:', session)

    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (idToAdd === session.user.id) {
      return new Response('Cannot add yourself', { status: 400 })
    }

    // check if already added (use helper to avoid caching?, because get can be cached)
    const isAlreadyAdded = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1

    if (isAlreadyAdded) {
      // return new Response('User is already added', { status: 400 })
      return new Response('Already added this user', { status: 400 })
    }

    const isAlreadyFriends = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )) as unknown as 0 | 1

    console.log('isAlreadyFriends', isAlreadyFriends)

    if (isAlreadyFriends) {
      return new Response('Already friends', { status: 400 })
    }

    // valid request, send friend request & notify
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`), // channel
      'incoming_friend_requests', // event
      { senderId: session.user.id, senderEmail: session.user.email } // data that is being sent
    )

    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }

    return new Response('Invalid request', { status: 400 })
  }
}

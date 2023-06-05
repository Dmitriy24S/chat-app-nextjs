import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { messageValidator } from '@/lib/validations/message'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json()
    const [userId1, userId2] = chatId.split('--')

    console.log('userid1', userId1)
    console.log('userId2', userId2)

    const session = await getServerSession(authOptions)
    console.log('session', session)
    if (!session) {
      console.log('no session')
      return new Response('Unauthorized', { status: 401 })
    }
    if (session.user.id !== userId1 && session.user.id !== userId2) {
      console.log('not match session user id and messages users ids')
      return new Response('Unauthorized', { status: 401 })
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1
    const friendList = (await fetchRedis(
      'smembers',
      `user:${session.user.id}:friends`
    )) as string[]
    const isFriend = friendList.includes(friendId)
    if (!isFriend) {
      console.log('not friends')
      return new Response('Unauthorized', { status: 401 })
    }

    const sender = (await fetchRedis('get', `user:${session.user.id}`)) as string
    const parsedSender = JSON.parse(sender) as IUser

    const timestamp = Date.now() // unix number
    const messageData: IMessage = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    }
    const message = messageValidator.parse(messageData)

    // notify all connected chat room clients
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`), // channel
      'incoming_message', // event
      message // data that is being sent
    )

    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      ...message,
      senderImg: parsedSender.image,
      senderName: parsedSender.name,
    })

    // all valid, send the message
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    }) // persist in db, zs - sorted set, by the timestamp

    return new Response('OK')
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    }

    return new Response('Internal Server Error', { status: 500 })
  }
}

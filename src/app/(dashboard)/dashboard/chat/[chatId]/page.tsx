import ChatInput from '@/components/ChatInput'
import ChatMessages from '@/components/ChatMessages'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    chatId: string
  }
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1) // json string that need to parse
    const dbMessages = results.map((message) => JSON.parse(message) as IMessage)
    const reversedDbMessages = dbMessages.reverse()
    const messages = messageArrayValidator.parse(reversedDbMessages)

    return messages
  } catch (error) {
    console.log(error)
    notFound()
  }
}

const Chat = async ({ params }: PageProps) => {
  const { chatId } = params

  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const { user } = session
  const [userId1, userId2] = chatId.split('--')

  if (user.id !== userId1 && user.id !== userId2) notFound()

  const chatPartnerId = user.id === userId1 ? userId2 : userId1
  // const chatPartner = await fetch(`/api/users/${chatPartnerId}
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as IUser
  const initialMessages = await getChatMessages(chatId)

  return (
    <div className='flex h-full max-h-[calc(100vh-6rem)] flex-1 flex-col justify-between'>
      {/* Chat Header */}
      <div className='flex justify-between border-b-2 border-gray-200 py-3 sm:items-center'>
        <div className='relative flex items-center space-x-4'>
          {/* Profile pic */}
          <div className='relative'>
            <div className='relative h-8 w-8 rounded-full bg-gray-100 sm:h-12 sm:w-12 '>
              {/* // ! */}
              {chatPartner.image && (
                <Image
                  fill
                  referrerPolicy='no-referrer'
                  src={chatPartner.image}
                  alt={`${chatPartner.name} profile picture`}
                  className='rounded-full'
                />
              )}
            </div>
          </div>

          <div className='flex flex-col leading-tight'>
            {/* Name */}
            <div className='flex items-center text-xl'>
              <span className='mr-3 font-semibold text-gray-700'>{chatPartner.name}</span>
            </div>
            {/* Email */}
            <span className='text-sm text-gray-600'>{chatPartner.email}</span>
          </div>
        </div>
      </div>

      <ChatMessages
        chatId={chatId}
        chatPartner={chatPartner}
        sessionUserImg={session.user.image}
        sessionId={session.user.id}
        initialMessages={initialMessages}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  )
}
export default Chat

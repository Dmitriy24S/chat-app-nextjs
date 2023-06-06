import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { chatHrefConstructor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const Dashboard = async () => {
  const session = await getServerSession(authOptions)
  if (!session) notFound() // When used in a React server component, this will set the status code to 404. When used in a custom app route it will just send a 404 status.

  const friends = await getFriendsByUserId(session.user.id)

  const friendsWithLastMessage = await Promise.all(
    // An array of Promises.
    // Creates a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected.
    friends.map(async (friend) => {
      const [lastMessage] = (await fetchRedis(
        'zrange',
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
        // get into sorted list -> get list of messages, -1 start index, -1 end index
        // )) as IMessage[]
      )) as string[]
      console.log('lastMessage', lastMessage)

      const lastMessageParsed = JSON.parse(lastMessage) as IMessage

      return {
        ...friend,
        lastMessageParsed,
      }
    })
  )
  console.log('friendsWithLastMessage', friendsWithLastMessage)

  return (
    <div className='container py-12'>
      <h1 className='mb-8 text-5xl font-bold'>Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className='text-sm text-zinc-500'>Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className='relative rounded-md border border-zinc-200 bg-zinc-50 p-3'
          >
            <div className='absolute inset-y-0 right-4 flex items-center'>
              <ChevronRight className='h-7 w-7 text-zinc-400' />
            </div>

            <Link
              href={`/dashboard/chat/${chatHrefConstructor(session.user.id, friend.id)}`}
              className='relative sm:flex'
            >
              {/* Profile picture */}
              <div className='mb-4 flex-shrink-0 sm:mb-0 sm:mr-4'>
                <div className='relative h-6 w-6 rounded-full bg-gray-100'>
                  {friend.image && (
                    <Image
                      referrerPolicy='no-referrer'
                      className='rounded-full'
                      alt={`${friend.name} profile picture`}
                      src={friend.image}
                      fill
                    />
                  )}
                </div>
              </div>
              {/* Message details */}
              <div>
                {/* Name */}
                <h4 className='text-lg font-semibold'>{friend.name}</h4>
                {/* Message */}
                <p className='mt-1 max-w-md'>
                  <span className='text-zinc-400'>
                    {friend.lastMessageParsed.senderId === session.user.id ? 'You: ' : ''}
                  </span>
                  {friend.lastMessageParsed.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  )
}
export default Dashboard

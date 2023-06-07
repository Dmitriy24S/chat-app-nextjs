import AddFriendButton from '@/components/AddFriendButton'
import FriendRequests from '@/components/FriendRequests'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

const Requests = async () => {
  const session = await getServerSession(authOptions)
  if (!session) notFound() // When used in a React server component, this will set the status code to 404. When used in a custom app route it will just send a 404 status.

  // ids of people who sent current logged in user a friend requests
  const incomingSenderIds = (await fetchRedis(
    'smembers', // (smembers = set members)
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[]

  const incomingFriendRequests = await Promise.all(
    // An array of Promises.
    // Creates a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected.
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis('get', `user:${senderId}`)) as string
      const senderParsed = JSON.parse(sender) as IUser
      return {
        senderId,
        senderEmail: senderParsed.email,
      }
    })
  )

  return (
    <main className='p-4 pt-8'>
      <h1 className='mb-8 text-5xl font-bold'>Friend requests</h1>
      <div className='flex flex-col gap-4'>
        <FriendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
      {/* <AddFriendButton /> */}
    </main>
  )
}
export default Requests

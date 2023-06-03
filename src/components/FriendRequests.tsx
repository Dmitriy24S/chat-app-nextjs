'use client'

import axios from 'axios'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[]
  sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const router = useRouter()
  const [friendRequests, setFriendRequests] =
    useState<IncomingFriendRequest[]>(incomingFriendRequests)

  const acceptFriendRequest = async (senderId: string) => {
    await axios.post('/api/friends/accept', { id: senderId })
    setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
    router.refresh()
  }

  const declineFriendRequest = async (senderId: string) => {
    await axios.post('/api/friends/decline', { id: senderId })
    setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
    router.refresh()
  }

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className='text-sm text-zinc-500'>No friend requests</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className='flex items-center gap-4'>
            <UserPlus className='text-black' />
            <p className='text-lg font-medium'>{request.senderEmail}</p>
            <button
              aria-label='accept friend request'
              onClick={() => acceptFriendRequest(request.senderId)}
              className='grid h-8 w-8 place-items-center rounded-full bg-indigo-600 transition hover:bg-indigo-700 hover:shadow-md'
            >
              <Check className='h-3/4 w-3/4 font-semibold text-white' />
            </button>
            <button
              aria-label='decline friend request'
              onClick={() => declineFriendRequest(request.senderId)}
              className='grid h-8 w-8 place-items-center rounded-full bg-red-600 transition hover:bg-red-700 hover:shadow-md'
            >
              <X className='h-3/4 w-3/4 font-semibold text-white' />
            </button>
          </div>
        ))
      )}
    </>
  )
}
export default FriendRequests

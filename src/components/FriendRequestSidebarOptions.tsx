'use client'

import { User } from 'lucide-react'
import Link from 'next/link'
import { FC, useState } from 'react'

interface FriendRequestSidebarOptionsProps {
  initialUnseenRequestCount: number
  sessionId: string
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({
  initialUnseenRequestCount,
  sessionId,
}) => {
  // const unseenRequestCount = 4
  const [unseenRequestCount, setUnseenRequestCount] = useState(initialUnseenRequestCount)

  return (
    <Link
      href='/dashboard/requests'
      className='group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
    >
      {/* User Picture */}
      <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-[0.625rem] text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600'>
        <User className='h-4 w-4' />
      </div>

      <p className='truncate'>Friend requests</p>

      {unseenRequestCount > 0 ? (
        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white'>
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  )
}
export default FriendRequestSidebarOptions

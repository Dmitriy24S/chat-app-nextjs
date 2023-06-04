'use client'

import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatListProps {
  friends: IUser[]
  sessionId: string
}

interface ExtendedMessage extends IMessage {
  senderImg: string
  senderName: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [unseenMessages, setUnseenMessages] = useState<IMessage[]>([])

  useEffect(() => {
    if (pathname?.includes('chat')) {
      setUnseenMessages((prev) => {
        return prev.filter((message) => !pathname.includes(message.senderId))
      })
    }
  }, [pathname])

  const chatHandler = useCallback(
    (message: ExtendedMessage) => {
      console.log('chatHandler - new chat message')

      const shouldNotify =
        pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`
      if (!shouldNotify) return

      // should be notified, i.e. chat window is not open
      toast.custom((t) => {
        // custom toast component
        return (
          <UnseenChatToast
            t={t}
            sessionId={sessionId}
            senderId={message.senderId}
            senderImg={message.senderImg}
            senderName={message.senderName}
            senderMessage={message.text}
          />
        )
      })
      setUnseenMessages((prev) => [...prev, message])
    },
    [pathname, sessionId]
  )

  const friendHandler = useCallback(() => {
    console.log('friendHandler - new friend request')
    router.refresh()
  }, [router])

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))
    pusherClient.bind('new_message', chatHandler)
    pusherClient.bind('new_friend', friendHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
      pusherClient.unbind('new_message', chatHandler)
      pusherClient.unbind('new_friend', friendHandler)
    }
  }, [pathname, sessionId, router, chatHandler, friendHandler])

  return (
    <ul role='list' className='-mx-2 max-h-[25rem] space-y-1 overflow-y-auto'>
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id
        }).length

        return (
          <li key={friend.id}>
            {/* for hard refresh use 'a' instead of Link */}
            <a
              href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
              className='group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            >
              {friend.name}{' '}
              {unseenMessagesCount > 0 && (
                <div className='flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white'>
                  {unseenMessagesCount}
                </div>
              )}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default SidebarChatList

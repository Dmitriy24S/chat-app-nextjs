'use client'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import { useRef, useState } from 'react'

interface MessagesProps {
  initialMessages: IMessage[]
  sessionId: string
  chatId: string
  chatPartner: IUser
  sessionUserImg: string | null | undefined
}

const ChatMessages = ({
  initialMessages,
  sessionId,
  chatId,
  chatPartner,
  sessionUserImg,
}: MessagesProps) => {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages)
  const scrolldownRef = useRef<HTMLDivElement | null>(null)

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'HH:mm')
  }

  return (
    <div
      id='messages'
      className='scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex h-full flex-1 flex-col-reverse gap-4 overflow-y-auto p-3'
    >
      <div ref={scrolldownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId
        return (
          // Message
          <div key={`${message.id}-${message.timestamp}`} className='chat-message'>
            <div
              className={cn('flex items-end', {
                'justify-end': isCurrentUser,
              })}
            >
              <div
                className={cn('mx-2 flex max-w-xs flex-col space-y-2 text-base', {
                  'order-1 items-end': isCurrentUser,
                  'order-2 items-start': !isCurrentUser,
                })}
              >
                <span
                  className={cn('inline-block rounded-lg px-4 py-2', {
                    'bg-indigo-600 text-white': isCurrentUser,
                    'bg-gray-200 text-gray-900': !isCurrentUser,
                    'rounded-br--none': !hasNextMessageFromSameUser && isCurrentUser,
                    'rounded-bl--none': !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{' '}
                  <span className='ml-2 text-xs text-gray-400'>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              {/* Message user img */}
              <div
                className={cn('relative h-6 w-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                {/* // TODO: google img default fallback? */}
                <Image
                  fill
                  src={isCurrentUser ? (sessionUserImg as string) : chatPartner.image}
                  alt='Profile picture'
                  referrerPolicy='no-referrer'
                  className='rounded-full'
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ChatMessages

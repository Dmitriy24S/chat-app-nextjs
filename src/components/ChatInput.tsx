'use client'

import axios from 'axios'
import { FC, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import TextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'

interface ChatInputProps {
  chatPartner: IUser
  chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const sendMessage = async () => {
    if (!input) return
    setIsLoading(true)
    try {
      await axios.post('/api/message/send', {
        text: input,
        chatId,
      })
      // await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='mb-2 border-t border-gray-200 p-4 sm:mb-0'>
      <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage() // ! Promises must be awaited, end with a call to .catch, or end with a call to .then with a rejection handler.sonarlint(typescript:S6544)
              setInput('')
              textareaRef.current?.focus()
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner}`}
          className='block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
        />
        {/* input bottom spacing */}
        <div
          onClick={() => textareaRef.current?.focus()}
          className='py-2'
          aria-hidden='true'
        >
          <div className='py-px'>
            <div className='h-9' />
          </div>
        </div>

        <div className='absolute bottom-0 right-0 flex justify-between py-2 pl-3 pr-2'>
          <div className='flex shrink-0'>
            <Button type='submit' isLoading={isLoading} onClick={sendMessage}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput

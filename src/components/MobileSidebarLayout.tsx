'use client'

import { SidebarOption } from '@/types/typings'
import { Dialog, Transition } from '@headlessui/react'
import { Menu, X } from 'lucide-react'
import { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC, Fragment, useEffect, useState } from 'react'
import FriendRequestSidebarOptions from './FriendRequestSidebarOptions'
import { Icons } from './Icons'
import SidebarChatList from './SidebarChatList'
import SignOutButton from './SignOutButton'
import Button, { buttonVariants } from './ui/Button'

interface MobileSidebarProps {
  friends: IUser[]
  session: Session
  unseenRequestCount: number
  sidebarOptions: SidebarOption[]
}

export const MobileSidebarLayout: FC<MobileSidebarProps> = ({
  friends,
  session,
  unseenRequestCount,
  sidebarOptions,
}) => {
  const [open, setOpen] = useState<boolean>(true)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className='fixed inset-x-0 top-0 border-b border-zinc-200 bg-zinc-50 px-4 py-2'>
      {/* Header */}
      <div className='flex w-full items-center justify-between'>
        <Link href='/dashboard' className={buttonVariants({ variant: 'ghost' })}>
          <Icons.Logo className='h-6 w-auto text-indigo-600' />
        </Link>
        <Button onClick={() => setOpen(true)} className='gap-4'>
          Menu <Menu className='h-6 w-6 ' />
        </Button>
      </div>

      {/* Sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter='ease-in-out duration-500'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in-out duration-500'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>
          {/* Sidebar */}
          <div className='fixed inset-0 overflow-hidden'>
            <div className='absolute inset-0 overflow-hidden'>
              <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
                <Transition.Child
                  as={Fragment}
                  enter='transform transition ease-in-out duration-500 sm:duration-700'
                  enterFrom='translate-x-full'
                  enterTo='translate-x-0'
                  leave='transform transition ease-in-out duration-500 sm:duration-700'
                  leaveFrom='translate-x-0'
                  leaveTo='translate-x-full'
                >
                  <Dialog.Panel className='pointer-events-auto relative w-screen max-w-md'>
                    <Transition.Child
                      as={Fragment}
                      enter='ease-in-out duration-500'
                      enterFrom='opacity-0'
                      enterTo='opacity-100'
                      leave='ease-in-out duration-500'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <div className='absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4'>
                        <button
                          type='button'
                          className='rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white'
                          onClick={() => setOpen(false)}
                        >
                          <span className='sr-only'>Close panel</span>
                          <X className='h-6 w-6' aria-hidden='true' />
                        </button>
                      </div>
                    </Transition.Child>
                    {/* Sidebar Content*/}
                    <div className='flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl'>
                      <div className='px-4 sm:px-6'>
                        <Dialog.Title className='text-base font-semibold leading-6 text-gray-900'>
                          Dashboard
                        </Dialog.Title>
                      </div>
                      <div className='relative mt-6 flex-1 px-4 sm:px-6'>
                        {/* Content */}
                        {friends.length > 0 && (
                          <div className='text-xs font-semibold leading-6 text-gray-400'>
                            Your chats
                          </div>
                        )}

                        <nav className='flex min-h-full flex-1 flex-col'>
                          <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                            <li>
                              <SidebarChatList
                                friends={friends}
                                sessionId={session.user.id}
                              />
                            </li>
                            <li>
                              <div className='text-xs font-semibold leading-6 text-gray-400'>
                                Overview
                              </div>
                              <ul role='list' className='-mx-2 mt-2 space-y-1'>
                                {sidebarOptions.map((option) => {
                                  const Icon = Icons[option.Icon]
                                  return (
                                    <li key={option.id}>
                                      <Link
                                        href={option.href}
                                        className='group flex gap-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 -outline-offset-4 hover:bg-gray-50 hover:text-indigo-600'
                                      >
                                        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600'>
                                          <Icon className='h-4 w-4' />
                                        </span>
                                        <span className='truncate'>{option.name}</span>
                                      </Link>
                                    </li>
                                  )
                                })}
                                <li>
                                  <FriendRequestSidebarOptions
                                    sessionId={session.user.id}
                                    initialUnseenRequestCount={unseenRequestCount}
                                  />
                                </li>
                              </ul>
                            </li>

                            {/* Sign Out */}
                            {/* <li className='-mx-6 mt-auto flex items-center pr-1'> */}
                            <li className='-ml-6 mt-auto flex items-center pr-1'>
                              <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                                {/* User Image */}
                                <div className='relative h-8 w-8 rounded-full bg-gray-100'>
                                  {session.user.image && (
                                    <Image
                                      fill
                                      referrerPolicy='no-referrer'
                                      className='rounded-full'
                                      src={session.user.image || ''}
                                      alt='Your profile picture'
                                    />
                                  )}
                                </div>

                                <span className='sr-only'>Your profile</span>
                                <div className='flex flex-col'>
                                  <span aria-hidden='true'>{session.user.name}</span>
                                  <span
                                    aria-hidden='true'
                                    className='text-xs text-zinc-400'
                                  >
                                    {session.user.email}
                                  </span>
                                </div>
                              </div>
                              <SignOutButton className='aspect-square h-full' />
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}

export default MobileSidebarLayout

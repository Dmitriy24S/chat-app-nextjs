'use client'

import { Loader2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { ButtonHTMLAttributes, FC, useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from './ui/Button'

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false)

  return (
    <Button
      {...props}
      variant='ghost'
      // ! Promise-returning function provided to attribute where a void return was expected.sonarlint(typescript:S6544)
      onClick={async () => {
        setIsSigningOut(true)
        try {
          await signOut()
        } catch (error) {
          toast.error('There was a problem signing out.')
        } finally {
          setIsSigningOut(false)
        }
      }}
    >
      {isSigningOut ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <LogOut className='h-4 w-4' />
      )}
    </Button>
  )
}
export default SignOutButton

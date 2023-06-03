import Button from '@/components/ui/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

const Dashboard = async () => {
  const session = await getServerSession(authOptions)

  return (
    <div>
      Dashboard
      <div className=''>
        <Button>Test</Button>
      </div>
      <pre>{JSON.stringify(session)}</pre>
    </div>
  )
}
export default Dashboard

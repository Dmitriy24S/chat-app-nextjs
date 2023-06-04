import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const LoadingRequestsSkeleton = () => {
  return (
    <div className='flex w-full flex-col gap-3'>
      <Skeleton className='mb-4' height={60} width={500} />
      <Skeleton height={50} width={350} />
      <Skeleton height={50} width={350} />
      <Skeleton height={50} width={350} />
    </div>
  )
}

export default LoadingRequestsSkeleton

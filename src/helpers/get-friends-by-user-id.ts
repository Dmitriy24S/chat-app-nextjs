import { fetchRedis } from './redis'

export const getFriendsByUserId = async (userId: string) => {
  // retrieve friends for current user
  const friendsIds = (await fetchRedis('smembers', `user:${userId}:friends`)) as string[]

  const friends = await Promise.all(
    friendsIds.map(async (friendId) => {
      const friend = (await fetchRedis('get', `user:${friendId}`)) as string
      const parsedFriend = JSON.parse(friend) as IUser
      return parsedFriend
    })
  )

  return friends
}

interface IUser {
  name: string
  email: string
  image: string
  id: string
}

interface IChat {
  id: string
  messages: IMessage[]
}

interface IMessage {
  id: string
  senderId: string
  // receiverId: string
  text: string
  timestamp: number // unix timestamp
}

interface IFriendRequest {
  id: string
  senderId: string
  receiverId: string
}

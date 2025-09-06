// Function that generates a random username so that the player can identify chats, but not who is who
function getRandomUsername(prefix = 'user') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}${suffix}`
}

export default getRandomUsername

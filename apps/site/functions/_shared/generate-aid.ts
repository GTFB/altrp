/**
 * Generates Altrp ID (AID) in format: {letter}-XXXXXX
 * where X is a random digit or latin letter
 */
export function generateAid(prefix: string): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomChars: string[] = []
  
  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomChars.push(characters[randomIndex])
  }
  
  return `${prefix}-${randomChars.join('')}`
}


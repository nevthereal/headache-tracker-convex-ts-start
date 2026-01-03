import { v } from 'convex/values'
import { action } from './_generated/server'

// Verify password against the environment variable
export const verifyPassword = action({
  args: {
    password: v.string(),
  },
  handler: async (_ctx, args) => {
    const correctPassword = process.env.HEADACHE_PASSWORD || ''

    if (!correctPassword) {
      throw new Error('Password not configured')
    }

    return args.password === correctPassword
  },
})

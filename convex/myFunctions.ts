import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all headache entries ordered by creation time (newest first)
export const listEntries = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query('headacheEntries')
      .order('desc')
      .collect()
    return entries
  },
})

// Add a new headache entry
export const addEntry = mutation({
  args: {
    score: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.score < 0 || args.score > 5) {
      throw new Error('Score must be between 0 and 5')
    }

    const id = await ctx.db.insert('headacheEntries', {
      score: args.score,
      notes: args.notes || '',
      createdAt: Date.now(),
    })

    return id
  },
})

// Check if there's already an entry for today
export const getTodayEntry = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date()
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    )

    const entry = await ctx.db
      .query('headacheEntries')
      .filter((q) =>
        q.and(
          q.gte(q.field('createdAt'), startOfDay.getTime()),
          q.lt(q.field('createdAt'), endOfDay.getTime()),
        ),
      )
      .first()

    return entry || null
  },
})

// Update an entry
export const updateEntry = mutation({
  args: {
    id: v.id('headacheEntries'),
    score: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.score < 0 || args.score > 5) {
      throw new Error('Score must be between 0 and 5')
    }

    await ctx.db.patch(args.id, {
      score: args.score,
      notes: args.notes || '',
    })
  },
})

// Delete an entry
export const deleteEntry = mutation({
  args: {
    id: v.id('headacheEntries'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

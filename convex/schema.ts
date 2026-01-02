import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  headacheEntries: defineTable({
    score: v.number(), // 0-5 scale
    notes: v.optional(v.string()),
    createdAt: v.number(), // timestamp in milliseconds
  }).index('created_time', ['createdAt']),
})

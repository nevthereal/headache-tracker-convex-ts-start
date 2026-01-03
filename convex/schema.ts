import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  headacheEntries: defineTable({
    score: v.number(), // 0-5 scale
    notes: v.optional(v.string()),
    createdAt: v.number(), // timestamp in milliseconds
    potentialCauses: v.optional(v.array(v.string())), // multiple causes like caffeine, alcohol, sleep, dehydration
    locations: v.optional(v.array(v.string())), // multiple locations like left temple, right side, back of head, etc.
    timeOfDay: v.optional(v.string()), // enum: morning, noon, afternoon, evening
  }).index('created_time', ['createdAt']),
})

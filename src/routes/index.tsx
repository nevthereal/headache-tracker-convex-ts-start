import { useEffect, useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { api } from '../../convex/_generated/api'
import { getSession, clearSession } from '~/lib/auth'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getSession()) {
      navigate({ to: '/login' })
    } else {
      setIsAuthed(true)
      setLoading(false)
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) return null

  return <TrackerDashboard />
}

function TrackerDashboard() {
  const navigate = useNavigate()
  const [score, setScore] = useState(2.5)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: entries } = useSuspenseQuery(
    convexQuery(api.myFunctions.listEntries, {}),
  )
  const { data: todayEntry } = useSuspenseQuery(
    convexQuery(api.myFunctions.getTodayEntry, {}),
  )
  const addEntry = useMutation(api.myFunctions.addEntry)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (todayEntry) return

    setSubmitting(true)
    try {
      await addEntry({ score, notes: notes.trim() || undefined })
      setScore(2.5)
      setNotes('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    clearSession()
    navigate({ to: '/login' })
  }

  const getScoreColor = (score: number) => {
    if (score < 1) return 'bg-green-100 text-green-800'
    if (score < 2) return 'bg-blue-100 text-blue-800'
    if (score < 3) return 'bg-yellow-100 text-yellow-800'
    if (score < 4) return 'bg-orange-100 text-orange-800'
    if (score < 5) return 'bg-red-100 text-red-800'
    return 'bg-red-200 text-red-900'
  }

  const getScoreLabel = (score: number) => {
    if (score < 1) return 'None'
    if (score < 2) return 'Mild'
    if (score < 3) return 'Moderate'
    if (score < 4) return 'Severe'
    if (score < 5) return 'Very Severe'
    return 'Extreme'
  }

  // Filter entries from past week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const weekEntries = entries.filter((e) => new Date(e.createdAt) >= weekAgo)

  // Prepare chart data - last 30 days
  const chartData = entries
    .filter((e) => {
      const entryDate = new Date(e.createdAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return entryDate >= thirtyDaysAgo
    })
    .reverse()
    .map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      score: entry.score,
    }))

  const avgScore =
    entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.score, 0) / entries.length).toFixed(
          1,
        )
      : '0'

  const weekHighest =
    weekEntries.length > 0
      ? Math.max(...weekEntries.map((e) => e.score)).toFixed(1)
      : '—'

  const weekLowest =
    weekEntries.length > 0
      ? Math.min(...weekEntries.map((e) => e.score)).toFixed(1)
      : '—'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Headache Tracker
            </h1>
            <p className="text-gray-600 mt-2">Track your headaches daily</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/entries"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition"
            >
              Manage Entries
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Total Entries</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {entries.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Average Score</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">
              {avgScore}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-xs font-medium text-gray-500">
              This Week - Highest
            </p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {weekHighest}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-xs font-medium text-gray-500">
              This Week - Lowest
            </p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {weekLowest}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {todayEntry ? 'Already logged today' : 'Log Entry'}
              </h2>

              {todayEntry ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      You've already logged an entry for today. Visit the{' '}
                      <Link to="/entries" className="font-semibold underline">
                        Manage Entries
                      </Link>{' '}
                      page to edit it.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Today's Score
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(todayEntry.score)}`}
                      >
                        {todayEntry.score.toFixed(1)} -{' '}
                        {getScoreLabel(todayEntry.score)}
                      </span>
                    </div>
                    {todayEntry.notes && (
                      <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                        <p className="font-medium mb-1">Notes:</p>
                        <p className="whitespace-pre-wrap">
                          {todayEntry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Intensity
                      </label>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}
                      >
                        {score.toFixed(1)} - {getScoreLabel(score)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={score}
                      onChange={(e) => setScore(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>None</span>
                      <span>Extreme</span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Notes{' '}
                      <span className="text-gray-500 font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How are you feeling? Any triggers or symptoms?"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span>Log Entry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Last 30 Days
              </h2>

              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value) => {
                          const score =
                            typeof value === 'number'
                              ? value
                              : parseFloat(String(value))
                          return `${score.toFixed(1)} - ${getScoreLabel(score)}`
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#a855f7"
                        strokeWidth={3}
                        dot={{ fill: '#a855f7', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Intensity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80">
                  <svg
                    className="w-16 h-16 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">No data yet</p>
                  <p className="text-gray-400 text-sm">
                    Log your first entry to see trends
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

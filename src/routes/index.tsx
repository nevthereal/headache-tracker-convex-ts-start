import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { LogOut, Plus, Check } from 'lucide-react'

import { api } from '../../convex/_generated/api'
import { clearSession, getSession } from '~/lib/auth'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from '~/components/ui/chart'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) return null

  return <TrackerDashboard />
}

const POTENTIAL_CAUSES = [
  'Caffeine',
  'Alcohol',
  'Sleep deprivation',
  'Dehydration',
  'Stress',
  'Screen time',
  'Weather change',
  'Hunger',
  'Bright light',
  'Hormonal',
]

const HEADACHE_LOCATIONS = [
  'Left temple',
  'Right temple',
  'Back of head',
  'Front of head',
  'Left side',
  'Right side',
  'Top of head',
  'Whole head',
]

const TIME_OF_DAY = ['Morning', 'Noon', 'Afternoon', 'Evening']

const chartConfig = {
  score: {
    label: 'Intensity',
    theme: {
      light: '#a855f7',
      dark: '#d946ef',
    },
  },
}

// Multi-select component
function MultiSelect({
  values,
  onValuesChange,
  options,
  placeholder,
}: {
  values: string[]
  onValuesChange: (values: string[]) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex flex-wrap gap-2 p-2 min-h-10 rounded-md border border-input bg-background text-left hover:bg-accent/50 transition"
      >
        {values.length > 0 ? (
          <>
            {values.map((value) => (
              <Badge key={value} variant="secondary">
                {value}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onValuesChange(values.filter((v) => v !== value))
                  }}
                  className="ml-1 hover:bg-secondary/80 rounded"
                >
                  ×
                </button>
              </Badge>
            ))}
          </>
        ) : (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-input rounded-md shadow-md z-50">
            <div className="p-2 max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (values.includes(option)) {
                      onValuesChange(values.filter((v) => v !== option))
                    } else {
                      onValuesChange([...values, option])
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded transition text-left"
                >
                  <div className="w-4 h-4 border border-input rounded flex items-center justify-center">
                    {values.includes(option) && <Check className="w-3 h-3" />}
                  </div>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Custom tooltip component
function CustomTooltip({ active, payload, getScoreLabel }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <div className="space-y-2 text-sm">
          <div className="font-semibold">
            {data.score.toFixed(1)} - {getScoreLabel(data.score)}
          </div>
          {data.potentialCauses && data.potentialCauses.length > 0 && (
            <div>
              <div className="font-medium text-xs">Causes:</div>
              <div className="text-xs text-muted-foreground ml-2">
                {data.potentialCauses.join(', ')}
              </div>
            </div>
          )}
          {data.locations && data.locations.length > 0 && (
            <div>
              <div className="font-medium text-xs">Locations:</div>
              <div className="text-xs text-muted-foreground ml-2">
                {data.locations.join(', ')}
              </div>
            </div>
          )}
          {data.timeOfDay && (
            <div>
              <div className="font-medium text-xs">Time:</div>
              <div className="text-xs text-muted-foreground ml-2">
                {data.timeOfDay}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

function TrackerDashboard() {
  const navigate = useNavigate()
  const [score, setScore] = useState(2.5)
  const [notes, setNotes] = useState('')
  const [potentialCauses, setPotentialCauses] = useState<Array<string>>([])
  const [locations, setLocations] = useState<Array<string>>([])
  const [timeOfDay, setTimeOfDay] = useState<string | undefined>(undefined)
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
      await addEntry({
        score,
        notes: notes.trim() || undefined,
        potentialCauses,
        locations,
        timeOfDay,
      })
      setScore(2.5)
      setNotes('')
      setPotentialCauses([])
      setLocations([])
      setTimeOfDay(undefined)
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

  const getScoreBadgeVariant = (
    scoreValue: number,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (scoreValue < 1) return 'secondary'
    if (scoreValue < 2) return 'outline'
    if (scoreValue < 3) return 'outline'
    if (scoreValue < 4) return 'secondary'
    return 'destructive'
  }

  const getScoreLabel = (scoreValue: number) => {
    if (scoreValue < 1) return 'None'
    if (scoreValue < 2) return 'Mild'
    if (scoreValue < 3) return 'Moderate'
    if (scoreValue < 4) return 'Severe'
    if (scoreValue < 5) return 'Very Severe'
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
      potentialCauses: entry.potentialCauses || [],
      locations: entry.locations || [],
      timeOfDay: entry.timeOfDay || null,
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Headache Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and track your daily headaches
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/entries">Manage Entries</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{entries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgScore}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Week - Highest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{weekHighest}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Week - Lowest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{weekLowest}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle>
                  {todayEntry ? 'Already Logged Today' : 'Log Entry'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEntry ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        You've already logged an entry for today. Visit{' '}
                        <Link
                          to="/entries"
                          className="font-semibold underline hover:no-underline"
                        >
                          Manage Entries
                        </Link>{' '}
                        to edit it.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Today's Score
                        </span>
                        <Badge variant={getScoreBadgeVariant(todayEntry.score)}>
                          {todayEntry.score.toFixed(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getScoreLabel(todayEntry.score)}
                      </p>
                      {todayEntry.notes && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Notes</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {todayEntry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Intensity */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold">
                          Intensity
                        </label>
                        <Badge variant={getScoreBadgeVariant(score)}>
                          {score.toFixed(1)}
                        </Badge>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={score}
                        onChange={(e) => setScore(parseFloat(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>None (0)</span>
                        <span>Extreme (5)</span>
                      </div>
                    </div>

                    {/* Potential Causes - Multi Select */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Potential Causes
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <MultiSelect
                        values={potentialCauses}
                        onValuesChange={setPotentialCauses}
                        options={POTENTIAL_CAUSES}
                        placeholder="Select causes..."
                      />
                    </div>

                    {/* Headache Locations - Multi Select */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Headache Location
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <MultiSelect
                        values={locations}
                        onValuesChange={setLocations}
                        options={HEADACHE_LOCATIONS}
                        placeholder="Select locations..."
                      />
                    </div>

                    {/* Time of Day - Single Select */}
                    <div>
                      <label
                        htmlFor="timeOfDay"
                        className="text-sm font-semibold block mb-2"
                      >
                        Time of Day
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <Select
                        value={timeOfDay || ''}
                        onValueChange={(value) =>
                          setTimeOfDay(value || undefined)
                        }
                      >
                        <SelectTrigger id="timeOfDay" className="w-full">
                          <SelectValue placeholder="Select a time of day" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OF_DAY.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        htmlFor="notes"
                        className="text-sm font-semibold block mb-2"
                      >
                        Notes
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How are you feeling? Any triggers or symptoms?"
                        rows={4}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Log Entry
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="w-full h-80">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip getScoreLabel={getScoreLabel} />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-score)', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Intensity"
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-80 text-center">
                    <div className="bg-secondary p-3 rounded-lg mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground mx-auto"
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
                    </div>
                    <p className="font-medium">No data yet</p>
                    <p className="text-sm text-muted-foreground">
                      Log your first entry to see trends
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

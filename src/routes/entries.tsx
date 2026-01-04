import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { ArrowLeft, Edit2, Trash2, Check, X } from 'lucide-react'

import { api } from '../../convex/_generated/api'
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

export const Route = createFileRoute('/entries')({
  component: EntriesPage,
})

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

function EntriesPage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState(2.5)
  const [editNotes, setEditNotes] = useState('')
  const [editPotentialCauses, setEditPotentialCauses] = useState<Array<string>>(
    [],
  )
  const [editLocations, setEditLocations] = useState<Array<string>>([])
  const [editTimeOfDay, setEditTimeOfDay] = useState<string | undefined>(
    undefined,
  )
  const [saving, setSaving] = useState(false)

  const { data: entries } = useSuspenseQuery(
    convexQuery(api.myFunctions.listEntries, {}),
  )
  const updateEntry = useMutation(api.myFunctions.updateEntry)
  const deleteEntry = useMutation(api.myFunctions.deleteEntry)

  const handleEdit = (
    id: string,
    score: number,
    notes: string,
    causes: Array<string> = [],
    locs: Array<string> = [],
    time: string | undefined = undefined,
  ) => {
    setEditingId(id)
    setEditScore(score)
    setEditNotes(notes)
    setEditPotentialCauses(causes)
    setEditLocations(locs)
    setEditTimeOfDay(time)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditScore(2.5)
    setEditNotes('')
    setEditPotentialCauses([])
    setEditLocations([])
    setEditTimeOfDay(undefined)
  }

  const handleSaveEdit = async (id: string) => {
    setSaving(true)
    try {
      await updateEntry({
        id: id as any,
        score: editScore,
        notes: editNotes.trim() || undefined,
        potentialCauses: editPotentialCauses,
        locations: editLocations,
        timeOfDay: editTimeOfDay,
      })
      setEditingId(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry({ id: id as any })
      } catch (err) {
        console.error(err)
      }
    }
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Manage Entries</h1>
            <p className="text-muted-foreground mt-1">
              Edit or delete your headache entries
            </p>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-secondary p-3 rounded-lg mb-4">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">No entries yet</h3>
                <p className="text-muted-foreground text-sm">
                  Create your first entry to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry._id}>
                {editingId === entry._id ? (
                  // Edit Mode
                  <CardHeader>
                    <CardTitle>Edit Entry</CardTitle>
                  </CardHeader>
                ) : null}

                {editingId === entry._id ? (
                  <CardContent className="space-y-6">
                    {/* Intensity */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold">
                          Intensity
                        </label>
                        <Badge variant={getScoreBadgeVariant(editScore)}>
                          {editScore.toFixed(1)}
                        </Badge>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={editScore}
                        onChange={(e) =>
                          setEditScore(parseFloat(e.target.value))
                        }
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>None (0)</span>
                        <span>Extreme (5)</span>
                      </div>
                    </div>

                    {/* Potential Causes */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Potential Causes
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <MultiSelect
                        values={editPotentialCauses}
                        onValuesChange={setEditPotentialCauses}
                        options={POTENTIAL_CAUSES}
                        placeholder="Select causes..."
                      />
                    </div>

                    {/* Headache Locations */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Headache Location
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <MultiSelect
                        values={editLocations}
                        onValuesChange={setEditLocations}
                        options={HEADACHE_LOCATIONS}
                        placeholder="Select locations..."
                      />
                    </div>

                    {/* Time of Day */}
                    <div>
                      <label
                        htmlFor="edit-timeOfDay"
                        className="text-sm font-semibold block mb-2"
                      >
                        Time of Day
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <Select
                        value={editTimeOfDay || ''}
                        onValueChange={(value) =>
                          setEditTimeOfDay(value || undefined)
                        }
                      >
                        <SelectTrigger id="edit-timeOfDay" className="w-full">
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
                        htmlFor="edit-notes"
                        className="text-sm font-semibold block mb-2"
                      >
                        Notes
                        <span className="text-muted-foreground font-normal text-xs ml-1">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="edit-notes"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="How are you feeling? Any triggers or symptoms?"
                        rows={4}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleSaveEdit(entry._id)}
                        disabled={saving}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  // View Mode
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <Badge variant={getScoreBadgeVariant(entry.score)}>
                              {entry.score.toFixed(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {getScoreLabel(entry.score)}
                            </span>
                            <time className="text-sm text-muted-foreground ml-auto">
                              {new Date(entry.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </time>
                          </div>
                        </div>
                      </div>

                      {entry.notes && (
                        <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md whitespace-pre-wrap">
                          {entry.notes}
                        </div>
                      )}

                      {entry.potentialCauses &&
                        entry.potentialCauses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Causes
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {entry.potentialCauses.map((cause) => (
                                <Badge
                                  key={cause}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {cause}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {entry.locations && entry.locations.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            Locations
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.locations.map((location) => (
                              <Badge
                                key={location}
                                variant="secondary"
                                className="text-xs"
                              >
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.timeOfDay && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            Time
                          </p>
                          <p className="text-sm">{entry.timeOfDay}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() =>
                            handleEdit(
                              entry._id,
                              entry.score,
                              entry.notes || '',
                              entry.potentialCauses || [],
                              entry.locations || [],
                              entry.timeOfDay,
                            )
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(entry._id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

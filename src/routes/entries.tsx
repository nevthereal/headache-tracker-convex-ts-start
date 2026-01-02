import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/entries')({
  component: EntriesPage,
})

function EntriesPage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState(2.5)
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: entries } = useSuspenseQuery(
    convexQuery(api.myFunctions.listEntries, {}),
  )
  const updateEntry = useMutation(api.myFunctions.updateEntry)
  const deleteEntry = useMutation(api.myFunctions.deleteEntry)

  const handleEdit = (id: string, score: number, notes: string) => {
    setEditingId(id)
    setEditScore(score)
    setEditNotes(notes)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditScore(2.5)
    setEditNotes('')
  }

  const handleSaveEdit = async (id: string) => {
    setSaving(true)
    try {
      await updateEntry({
        id: id as any,
        score: editScore,
        notes: editNotes.trim() || undefined,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="text-purple-600 hover:text-purple-700 font-medium mb-2 inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Manage Entries</h1>
            <p className="text-gray-600 mt-2">
              Edit or delete your headache entries
            </p>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No entries yet
              </h3>
              <p className="text-gray-600">
                Create your first entry from the tracker
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {editingId === entry._id ? (
                  // Edit Mode
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Edit Entry
                      </h3>
                      <time className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Intensity
                        </label>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(editScore)}`}
                        >
                          {editScore.toFixed(1)} - {getScoreLabel(editScore)}
                        </span>
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>None</span>
                        <span>Extreme</span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="edit-notes"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Notes{' '}
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="edit-notes"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="How are you feeling? Any triggers or symptoms?"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSaveEdit(entry._id)}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-semibold py-2 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(entry.score)}`}
                          >
                            {entry.score.toFixed(1)} -{' '}
                            {getScoreLabel(entry.score)}
                          </span>
                          <time className="text-sm text-gray-500">
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
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {entry.notes}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() =>
                          handleEdit(entry._id, entry.score, entry.notes || '')
                        }
                        className="flex-1 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

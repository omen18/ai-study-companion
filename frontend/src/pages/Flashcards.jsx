import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import Loader from '../components/Loader.jsx'
import FlashcardStudy from '../components/FlashcardStudy.jsx'
import { flashcardsApi, notesApi } from '../services/api.js'
import { formatDate } from '../utils/formatDate.js'

export default function Flashcards() {
  const [decks, setDecks] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const [genNoteId, setGenNoteId] = useState('')
  const [genCount, setGenCount] = useState(8)
  const [generating, setGenerating] = useState(false)

  const [studyingDeck, setStudyingDeck] = useState(null)

  const refresh = () => flashcardsApi.list().then(setDecks)

  useEffect(() => {
    Promise.all([refresh(), notesApi.list().then(setNotes)]).finally(() =>
      setLoading(false),
    )
  }, [])

  const generate = async (e) => {
    e.preventDefault()
    if (!genNoteId) return
    setGenerating(true)
    try {
      await flashcardsApi.generate(Number(genNoteId), Number(genCount))
      await refresh()
      setGenNoteId('')
    } finally {
      setGenerating(false)
    }
  }

  const openDeck = async (deckId) => {
    const deck = await flashcardsApi.get(deckId)
    if (!deck.cards?.length) return
    setStudyingDeck(deck)
  }

  const remove = async (id) => {
    if (!confirm('Delete this deck?')) return
    await flashcardsApi.remove(id)
    await refresh()
  }

  if (loading) return <Loader />

  if (studyingDeck) {
    return (
      <div className="mx-auto max-w-2xl">
        <FlashcardStudy deck={studyingDeck} onExit={() => setStudyingDeck(null)} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[380px_1fr]">
      <Card title="Generate from a note">
        <form onSubmit={generate} className="space-y-3">
          <select
            value={genNoteId}
            onChange={(e) => setGenNoteId(e.target.value)}
            className="input"
            required
          >
            <option value="">— Choose a note —</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
          <label className="block text-xs text-slate-500">
            Number of cards ({genCount})
            <input
              type="range" min={3} max={20} step={1}
              value={genCount}
              onChange={(e) => setGenCount(e.target.value)}
              className="mt-1 w-full"
            />
          </label>
          <button type="submit" disabled={generating} className="btn-primary w-full">
            {generating ? '✨ Generating…' : '✨ Generate deck'}
          </button>
        </form>
      </Card>

      <div className="space-y-3">
        {decks.length === 0 && (
          <p className="text-sm text-slate-500">
            No decks yet. Pick a note on the left and let the AI build your first deck.
          </p>
        )}

        {decks.map((d) => (
          <Card
            key={d.id}
            title={d.name}
            action={
              <div className="flex gap-2">
                <button onClick={() => openDeck(d.id)} className="btn-primary">
                  Study →
                </button>
                <button onClick={() => remove(d.id)} className="text-xs text-rose-600 hover:underline">
                  Delete
                </button>
              </div>
            }
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {d.cards?.length ?? 0} cards · created {formatDate(d.created_at)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

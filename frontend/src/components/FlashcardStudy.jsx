import { useState } from 'react'
import { activityApi, flashcardsApi } from '../services/api.js'

export default function FlashcardStudy({ deck, onExit }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  const card = deck.cards[index]

  const rate = async (rating) => {
    try {
      await flashcardsApi.review(card.id, rating)
      await activityApi.log({ minutes: 0, cards_reviewed: 1 })
    } catch { /* ignore */ }

    if (index + 1 >= deck.cards.length) {
      setDone(true)
      return
    }
    setIndex((i) => i + 1)
    setFlipped(false)
  }

  if (done) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold">🎉 Deck complete!</h2>
        <p className="mt-2 text-slate-500">
          You reviewed {deck.cards.length} card{deck.cards.length === 1 ? '' : 's'}.
        </p>
        <button onClick={onExit} className="btn-primary mt-4">Back to decks</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Card {index + 1} / {deck.cards.length}</span>
        <button onClick={onExit} className="btn-ghost">✕ Exit</button>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="card flex min-h-[280px] items-center justify-center text-center text-lg transition hover:shadow-md"
      >
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            {flipped ? 'Answer' : 'Question'}
          </p>
          <p className="whitespace-pre-wrap text-xl font-medium">
            {flipped ? card.answer : card.question}
          </p>
          {!flipped && (
            <p className="mt-6 text-xs text-slate-400">Click to reveal</p>
          )}
        </div>
      </button>

      {flipped && (
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => rate('again')} className="btn-ghost border-rose-300 text-rose-600">
            Again
          </button>
          <button onClick={() => rate('good')} className="btn-ghost border-amber-300 text-amber-700">
            Good
          </button>
          <button onClick={() => rate('easy')} className="btn-primary">
            Easy
          </button>
        </div>
      )}
    </div>
  )
}

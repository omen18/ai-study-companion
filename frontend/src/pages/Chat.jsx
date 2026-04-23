import { useEffect, useState } from 'react'
import ChatBox from '../components/ChatBox.jsx'
import Card from '../components/Card.jsx'
import { notesApi } from '../services/api.js'

export default function Chat() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)

  useEffect(() => {
    notesApi.list().then(setNotes).catch(() => setNotes([]))
  }, [])

  return (
    <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
      <Card title="Ground chat in a note" className="h-fit">
        <select
          value={selectedNote ?? ''}
          onChange={(e) => setSelectedNote(e.target.value ? Number(e.target.value) : null)}
          className="input"
        >
          <option value="">— No context —</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Choose a note and the AI will use it as context for your questions.
        </p>
      </Card>

      <ChatBox noteId={selectedNote} />
    </div>
  )
}

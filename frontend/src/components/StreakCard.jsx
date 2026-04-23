import Card from './Card.jsx'

export default function StreakCard({ summary }) {
  if (!summary) return null
  const { current_streak, longest_streak, total_minutes, total_cards } = summary

  return (
    <Card title="Your streak">
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <Stat emoji="🔥" label="Current"    value={`${current_streak}d`} />
        <Stat emoji="🏆" label="Longest"    value={`${longest_streak}d`} />
        <Stat emoji="⏱️" label="Total time" value={`${total_minutes}m`} />
        <Stat emoji="🎴" label="Cards"      value={total_cards} />
      </div>
    </Card>
  )
}

function Stat({ emoji, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800">
      <div className="text-xl">{emoji}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

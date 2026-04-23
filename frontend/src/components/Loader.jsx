export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <span className="h-3 w-3 animate-ping rounded-full bg-brand-500" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

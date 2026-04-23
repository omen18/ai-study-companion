export default function Card({ title, children, className = '', action = null }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between">
          {title && (
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h3>
          )}
          {action}
        </header>
      )}
      <div>{children}</div>
    </section>
  )
}

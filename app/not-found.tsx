export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-[40px]" aria-hidden="true">
        📚
      </span>
      <h1 className="text-[22px] font-bold text-ink">Page not found</h1>
      <p className="text-[15px] text-muted">
        This profile does not exist, or the link has changed.
      </p>
    </main>
  )
}

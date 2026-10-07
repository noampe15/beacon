export default function AnnotationPin({ n, noteId, onOpen, className = "" }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen?.(noteId)
      }}
      className={`z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#6d5cff] text-[11px] font-bold text-white shadow outline-none ring-2 ring-white hover:bg-[#5b4cf0] focus-visible:ring-[#6d5cff] ${className}`}
      aria-label={`PM note ${n}`}
    >
      {n}
    </button>
  )
}

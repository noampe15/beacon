import { useEffect, useState } from "react"

export default function TypewriterText({ text, className }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    setN(0)
    if (!text) return undefined
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id)
          return v
        }
        return v + 1
      })
    }, 14)
    return () => window.clearInterval(id)
  }, [text])

  const done = n >= text.length
  return (
    <p className={className}>
      {text.slice(0, n)}
      <span className={`ml-0.5 inline-block h-[1em] w-px translate-y-0.5 bg-[#6d5cff] ${done ? "opacity-0" : "animate-pulse"}`} />
    </p>
  )
}

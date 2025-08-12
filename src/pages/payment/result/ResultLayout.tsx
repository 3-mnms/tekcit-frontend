// src/pages/result/ResultLayout.tsx
import { useNavigate } from 'react-router-dom'

export default function ResultLayout({
  title, message, primary, secondary,
}: {
  title: string
  message: string
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
}) {
  const nav = useNavigate()
  return (
    <div className="mx-auto max-w-[520px] p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-8">{message}</p>
      <div className="flex gap-3 justify-center">
        <button className="px-5 py-3 rounded-xl border" onClick={() => nav(primary.to)}>
          {primary.label}
        </button>
        {secondary && (
          <button className="px-5 py-3 rounded-xl border" onClick={() => nav(secondary.to)}>
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  )
}

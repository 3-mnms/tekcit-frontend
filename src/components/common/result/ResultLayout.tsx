// src/pages/result/ResultLayout.tsx
import { useNavigate } from 'react-router-dom'

export default function ResultLayout({
  title, message, primary,
}: {
  title: string
  message: string
  primary: { label: string; to: string }
}) {
  const navigate = useNavigate()

  // 확인 버튼 클릭 시: 팝업이면 닫고, 아니면 내부 라우팅
  const handleConfirm = () => {
    // window.opener가 존재하고 부모 창이 살아있으면 팝업으로 간주
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      window.close()
    } else {
      navigate(primary.to)
    }
  }

  return (
    <div className="mx-auto max-w-[520px] h-[700px] p-8 text-center flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-8">{message}</p>
      <div className="flex gap-3 justify-center items-center">
        <button className="px-5 py-3 rounded-xl border" onClick={handleConfirm}>
          확인
        </button>
      </div>
    </div>
  )
}

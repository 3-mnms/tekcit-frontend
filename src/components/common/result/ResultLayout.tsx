// src/pages/result/ResultLayout.tsx
// 주석: 내부 경로는 react-router nav, 외부(절대) URL은 location.assign 멍
import { se } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom'

export default function ResultLayout({
  title, message, primary, secondary,
}: {
  title: string
  message: string
  primary: { label: string; to: string }
}) {
  const nav = useNavigate()

  // 주석: to가 'http'로 시작하면 외부 이동, 아니면 내부 라우팅 멍
  const go = (to: string) => {
    // if (/^https?:\/\//i.test(to)) {
    // const openerWindow = window.opener as (Window & typeof globalThis) | null;
    // if (openerWindow) {
    //   console.log("opener window가 존재");
    //   console.log("경로는 : ",to);


    //   openerWindow.postMessage({ type: "NAVIGATE", path: to }, window.location.origin)
    // }
    // self.close()
    // window.location.assign(to) // 주석: 절대 URL은 브라우저 네비게이션로 처리 멍

    // }
    return nav(to) // 주석: 내부 경로만 react-router로 이동 멍
  }

  return (
    <div className="mx-auto max-w-[520px] h-[700px] p-8 text-center flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-3 justify-center items-center">
          <button className="px-5 py-3 rounded-xl border" onClick={() => self.close()}>
            확인
          </button>
        </div>
    </div>
  )
}

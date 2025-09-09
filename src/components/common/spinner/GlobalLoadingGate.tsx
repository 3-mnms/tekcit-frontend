// src/components/common/spinner/GlobalLoadingGate.tsx
import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import Spinner from './Spinner'

/** 전역 로딩 게이트: fetch/mutate 동시 감지 */
export default function GlobalLoadingGate() {
  // 주석: 진행 중인 쿼리/뮤테이션 개수
  const fetching = useIsFetching()
  const mutating = useIsMutating()

  // 주석: 네트워크 동작이 하나라도 있으면 스피너 표시
  if (fetching > 0 || mutating > 0) {
    return <Spinner text="데이터를 불러오는 중입니다..." />
  }
  return null
}

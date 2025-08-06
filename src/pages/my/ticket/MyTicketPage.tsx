import React from 'react'
import { useNavigate } from 'react-router-dom'
import MyInfoCardItem from '@/components/my/myinfo/MyInfoCardItem'

const MyTicketPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="w-full p-8">
      <h2 className="text-2xl font-bold mb-6">내 티켓</h2>

      <div className="flex flex-col gap-4">
        <MyInfoCardItem
          label="예매 확인/취소"
          onClick={() => navigate('/mypage/ticket/history')}
        />
        <MyInfoCardItem label="양도하기" onClick={() => navigate('/mypage/ticket/transfer')} />
        <MyInfoCardItem
          label="입장 인원 수 조회"
          onClick={() => navigate('/mypage/ticket/entry-check')}
        />
      </div>
    </div>
  )
}

export default MyTicketPage

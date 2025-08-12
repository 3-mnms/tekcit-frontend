import React from 'react';

// 더미 데이터
const dummyTickets = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  title: `티켓 #${i + 1}`,
  date: '2025-10-18',
  venue: '올림픽공원',
  price: 50000 + i * 1000,
  thumbnail: `https://picsum.photos/seed/${i}/300/400`,
}));

const ResultPanel: React.FC = () => {
  return (
    <section style={{ padding: '1rem' }}>
      <h3>검색 결과 ({dummyTickets.length}개)</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {dummyTickets.map((t) => (
          <div key={t.id} style={{ width: '200px' }}>
            <img src={t.thumbnail} alt={t.title} style={{ width: '100%' }} />
            <h4>{t.title}</h4>
            <p>{t.date} · {t.venue}</p>
            <p>{t.price.toLocaleString()}원~</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResultPanel;

// src/components/stats/TicketProgressGraph.tsx

import React from 'react';
import styles from './TicketProgressGraph.module.css';
import { FaChartBar } from 'react-icons/fa6';

interface Props {
  currentTickets: number; // 현재 예매 수
  totalCapacity: number;  // 총 목표 수
}

const TicketProgressGraph: React.FC<Props> = ({ currentTickets, totalCapacity }) => {
  const progress = (currentTickets === 0 || totalCapacity === 0) ? 0 : (currentTickets / totalCapacity) * 100;
  const progressPercentage = Math.min(progress, 100); 

  return (
    <section className={styles.container} aria-labelledby="stats-title">
      <h3 className={styles.title} id="stats-title">
      <FaChartBar className={styles.icon} /> 전체 판매율 </h3>
      <div className={styles.graphContainer}>
        <div className={styles.labelWrapper}>
          <span className={styles.label}>예매 수 </span>
          <span className={styles.percentage}>{Math.round(progress)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
          <div className={styles.ticketCountWrapper}>
            <span className={styles.currentTickets}>{currentTickets}</span>
            <span className={styles.totalCapacity}>/ {totalCapacity}명</span>
        </div>
      </div>
    </section>
  );
};

export default TicketProgressGraph;
import React from 'react';
import styles from './StatisticsSection.module.css';
// import TicketProgressGraph from '@/components/operatManage/statistics/TicketProgressGraph';
import Statistics from '@/components/festival/detail/FestivalStatisticsSection';
import type { UserStatsResponse  } from '@/models/admin/statistics'; 

interface Props {
  data: UserStatsResponse['data'] | null;
}

const StatisticsSection: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const genderData = [
      { label: '남', value: data.genderCount.male },
      { label: '여', value: data.genderCount.female },
  ];
  const ageData = Object.entries(data.ageGroupCount).map(([label, value]) => ({ label, value }));

  return (
    <div className={styles.container}>
        <div className={styles.statsSection}>  
          <Statistics
            genderData={genderData}
            ageData={ageData}/>
        </div>
    </div>
  );
};

export default StatisticsSection;
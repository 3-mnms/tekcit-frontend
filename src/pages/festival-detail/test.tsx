import React from 'react';
// import Info from '@components/festival/FestivalInfoSection';
import Scheduler from '@components/festival/FestivalScheduleSection';
import '@fortawesome/fontawesome-free/css/all.min.css';

const MainPage: React.FC = () => {
    
  return (
    <div>
      <Scheduler />
    </div>
  );
};

export default MainPage;
import React, { useState } from "react";

export default function ScheduleInput() {
  const [schedules, setSchedules] = useState<{ date: string; times: string[] }[]>([]);

  const addSchedule = () => {
    setSchedules([...schedules, { date: "", times: [""] }]);
  };

  const updateDate = (index: number, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index].date = value;
    setSchedules(newSchedules);
  };

  const updateTime = (scheduleIndex: number, timeIndex: number, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[scheduleIndex].times[timeIndex] = value;
    setSchedules(newSchedules);
  };

  const addTime = (scheduleIndex: number) => {
    const newSchedules = [...schedules];
    newSchedules[scheduleIndex].times.push("");
    setSchedules(newSchedules);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>공연 날짜 & 시간 설정</h2>
      {schedules.map((schedule, scheduleIndex) => (
        <div key={scheduleIndex} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
          <label>
            날짜:
            <input
              type="date"
              value={schedule.date}
              onChange={(e) => updateDate(scheduleIndex, e.target.value)}
            />
          </label>
          <div style={{ marginTop: "10px" }}>
            {schedule.times.map((time, timeIndex) => (
              <div key={timeIndex} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(scheduleIndex, timeIndex, e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={() => addTime(scheduleIndex)}>
              + 시간 추가
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addSchedule}>
        + 날짜 추가
      </button>
      <pre>{JSON.stringify(schedules, null, 2)}</pre>
    </div>
  );
}

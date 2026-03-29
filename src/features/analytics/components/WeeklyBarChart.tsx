import React, { useEffect, useState } from 'react';
import { database, DailyStatRecord } from '../../../core/capacitor/Database';
import { getTodayDate } from '../../../core/utils/TimeUtils';
import './WeeklyBarChart.css';

const WeeklyBarChart: React.FC = () => {
  const [stats, setStats] = useState<DailyStatRecord[]>([]);
  const [maxMinutes, setMaxMinutes] = useState(60);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const rawStats = await database.getDailyStats(7);
        // We want exactly 7 days, including zero days if missing
        const last7Days: string[] = [];
        const todayStr = getTodayDate();
        const baseDate = new Date(todayStr); // local time
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date(baseDate.getTime());
          d.setDate(d.getDate() - i);
          // Format as YYYY-MM-DD
          const yy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          last7Days.push(`${yy}-${mm}-${dd}`);
        }

        const filledStats: DailyStatRecord[] = last7Days.map(dateStr => {
          const found = rawStats.find(s => s.date === dateStr);
          return found || {
            id: 0,
            date: dateStr,
            total_focus_minutes: 0,
            peak_hour: null,
            interruptions: 0,
            sessions_count: 0
          };
        });

        const maxMins = Math.max(...filledStats.map(s => s.total_focus_minutes), 30); // minimum scale is 30 mins
        setMaxMinutes(maxMins);
        setStats(filledStats);
      } catch (e) {
        console.error("Failed to load chart data", e);
      }
    };
    
    fetchChartData();
  }, []);

  // Format short day name (e.g. Paz, Pzt...)
  const formatDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return dayNames[d.getDay()];
  };

  return (
    <div className="bar-chart-container fade-in">
      <div className="chart-y-axis">
        <span className="y-label">{maxMinutes}m</span>
        <span className="y-label">{Math.floor(maxMinutes/2)}m</span>
        <span className="y-label">0m</span>
      </div>
      
      <div className="chart-area">
        <div className="chart-grid">
          <div className="grid-line line-top"></div>
          <div className="grid-line line-mid"></div>
          <div className="grid-line line-bot"></div>
        </div>
        
        <div className="chart-bars">
          {stats.map((stat, idx) => {
            const heightPercent = Math.max(2, (stat.total_focus_minutes / maxMinutes) * 100);
            const isToday = stat.date === getTodayDate();
            
            return (
              <div key={idx} className="bar-wrapper">
                <div 
                  className={`bar-fill ${isToday ? 'today-barglow' : ''}`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="bar-tooltip">{stat.total_focus_minutes} dk</div>
                </div>
                <div className={`bar-label ${isToday ? 'label-today' : ''}`}>
                  {formatDayName(stat.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyBarChart;

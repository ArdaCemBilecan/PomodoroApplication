import React, { useEffect, useState, useRef } from 'react';
import { database, DailyStatRecord } from '../../../core/capacitor/Database';
import { getTodayDate } from '../../../core/utils/TimeUtils';
import './MonthlyBarChart.css';

const MonthlyBarChart: React.FC = () => {
  const [stats, setStats] = useState<DailyStatRecord[]>([]);
  const [maxMinutes, setMaxMinutes] = useState(60);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const rawStats = await database.getDailyStats(31); // Fetch enough days
        const todayStr = getTodayDate();
        const baseDate = new Date(todayStr); // local time
        
        const yy = baseDate.getFullYear();
        const mm = baseDate.getMonth(); // 0-based
        const daysInMonth = new Date(yy, mm + 1, 0).getDate(); // last day of month

        const monthDays: string[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
          const dStr = `${yy}-${String(mm + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          monthDays.push(dStr);
        }

        const filledStats: DailyStatRecord[] = monthDays.map(dateStr => {
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

        const highestMins = Math.max(...filledStats.map(s => s.total_focus_minutes), 30);
        let maxMins = 60;
        if (highestMins > 60) {
          maxMins = Math.ceil(highestMins / 60) * 60;
        }
        setMaxMinutes(maxMins);
        setStats(filledStats);

        // Auto-scroll to the right so 'today' is visible
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
          }
        }, 100);
      } catch (e) {
        console.error("Failed to load chart data", e);
      }
    };
    
    fetchChartData();
  }, []);

  const formatMinsToHours = (mins: number) => {
    if (mins === 0) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const getDayLabel = (dateStr: string) => {
    // Just return the day number (e.g. 15 from 2026-03-15)
    return parseInt(dateStr.split('-')[2], 10);
  };

  return (
    <div className="bar-chart-container fade-in">
      <div className="chart-y-axis">
        <span className="y-label">{formatMinsToHours(maxMinutes)}</span>
        <span className="y-label">{formatMinsToHours(maxMinutes / 2)}</span>
        <span className="y-label">0m</span>
      </div>
      
      <div className="chart-area">
        <div className="chart-grid">
          <div className="grid-line line-top"></div>
          <div className="grid-line line-mid"></div>
          <div className="grid-line line-bot"></div>
        </div>
        
        <div className="chart-bars monthly-scroll" ref={scrollRef}>
          {stats.map((stat, idx) => {
            const heightPercent = Math.max(2, (stat.total_focus_minutes / maxMinutes) * 100);
            const isToday = stat.date === getTodayDate();
            const dayNum = getDayLabel(stat.date);
            const showLabel = dayNum % 5 === 0 || dayNum === 1 || isToday; // 1, 5, 10... and today
            
            return (
              <div key={idx} className="bar-wrapper-monthly">
                <div 
                  className={`bar-fill ${isToday ? 'today-barglow' : ''} ${stat.total_focus_minutes > 0 ? 'has-data' : ''}`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="bar-tooltip">{formatMinsToHours(stat.total_focus_minutes)}</div>
                </div>
                <div className={`bar-label ${isToday ? 'label-today' : ''}`}>
                  {showLabel ? dayNum : '‧'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyBarChart;

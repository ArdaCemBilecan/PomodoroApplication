import React, { useEffect, useState } from 'react';
import { database, DailyStatRecord } from '../../../core/capacitor/Database';
import { getTodayDate } from '../../../core/utils/TimeUtils';
import './MonthlyHeatmap.css';

interface HeatmapCell {
  date: string;
  isCurrentMonth: boolean;
  totalFocus: number;
  sessionsCount: number;
}

const MonthlyHeatmap: React.FC = () => {
  const [grid, setGrid] = useState<HeatmapCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const todayStr = getTodayDate();
        const baseDate = new Date(todayStr);
        const yy = baseDate.getFullYear();
        const mm = baseDate.getMonth();

        // 1. Get stats from DB (fetch 45 days back to ensure we cover the whole visual calendar)
        const rawStats = await database.getDailyStats(45);

        // 2. Build the calendar grid
        const firstDayOfMonth = new Date(yy, mm, 1);
        const lastDayOfMonth = new Date(yy, mm + 1, 0);
        
        // Start date of the grid (Monday of the first week)
        // JavaScript getDay() is 0 (Sun) to 6 (Sat)
        let startGridDate = new Date(firstDayOfMonth);
        const firstDayOfWeek = startGridDate.getDay() === 0 ? 7 : startGridDate.getDay();
        startGridDate.setDate(firstDayOfMonth.getDate() - (firstDayOfWeek - 1)); // Back out to previous Monday

        // End date of the grid (Sunday of the last week)
        let endGridDate = new Date(lastDayOfMonth);
        const lastDayOfWeek = endGridDate.getDay() === 0 ? 7 : endGridDate.getDay();
        endGridDate.setDate(lastDayOfMonth.getDate() + (7 - lastDayOfWeek));

        const cells: HeatmapCell[] = [];
        let curr = new Date(startGridDate);
        while (curr <= endGridDate) {
          const cyy = curr.getFullYear();
          const cmm = String(curr.getMonth() + 1).padStart(2, '0');
          const cdd = String(curr.getDate()).padStart(2, '0');
          const dStr = `${cyy}-${cmm}-${cdd}`;

          const stat = rawStats.find(s => s.date === dStr);
          
          cells.push({
            date: dStr,
            isCurrentMonth: curr.getMonth() === mm,
            totalFocus: stat ? stat.total_focus_minutes : 0,
            sessionsCount: stat ? stat.sessions_count : 0,
          });

          curr.setDate(curr.getDate() + 1);
        }

        setGrid(cells);
        
        // By default, select today if it exists in the grid
        const todayCell = cells.find(c => c.date === todayStr);
        if (todayCell) setSelectedCell(todayCell);
        
      } catch (error) {
        console.error("Failed to load heatmap data", error);
      }
    };

    fetchHeatmapData();
  }, []);

  const getLevelClass = (minutes: number) => {
    if (minutes === 0) return 'level-0';
    if (minutes < 30) return 'level-1';
    if (minutes < 60) return 'level-2';
    if (minutes < 120) return 'level-3';
    return 'level-4';
  };

  const formatMinsToHours = (mins: number) => {
    if (mins === 0) return '0 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="heatmap-container fade-in">
      <div className="heatmap-header">
        <div className="heatmap-title">Activity Calendar</div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-cell level-0"></div>
          <div className="legend-cell level-1"></div>
          <div className="legend-cell level-2"></div>
          <div className="legend-cell level-3"></div>
          <div className="legend-cell level-4"></div>
          <span>More</span>
        </div>
      </div>

      <div className="heatmap-grid-wrapper">
        <div className="heatmap-weekdays">
          {daysOfWeek.map(d => (
            <div key={d} className="weekday-label">{d}</div>
          ))}
        </div>
        
        <div className="heatmap-grid">
          {grid.map((cell) => {
            const isToday = cell.date === getTodayDate();
            const isSelected = selectedCell?.date === cell.date;
            
            return (
              <div 
                key={cell.date}
                className={`heatmap-cell ${getLevelClass(cell.totalFocus)} 
                           ${!cell.isCurrentMonth ? 'out-of-month' : ''} 
                           ${isToday ? 'is-today' : ''} 
                           ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedCell(cell)}
              >
                {/* Optional: Add a subtle date number on the leaf on normal sizes */}
                <span className="cell-day-num">{new Date(cell.date).getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCell && (
        <div className="heatmap-detail-card glow fade-in">
          <div className="detail-date">{formatDateLabel(selectedCell.date)}</div>
          <div className="detail-stats">
            <div className="detail-duration">
              <span className="leaf-icon">🍃</span> 
              {formatMinsToHours(selectedCell.totalFocus)}
            </div>
            <div className="detail-sessions">
              <span className="session-icon">🍅</span>
              {selectedCell.sessionsCount} sessions
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyHeatmap;

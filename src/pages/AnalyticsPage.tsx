import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { database } from '../core/capacitor/Database';
import WeeklyBarChart from '../features/analytics/components/WeeklyBarChart';
import './AnalyticsPage.css';

const AnalyticsPage: React.FC = () => {
  const [totalFocus, setTotalFocus] = useState(0);

  useEffect(() => {
    // Initial fetch of some stats to show
    const fetchStats = async () => {
      const stats = await database.getDailyStats(7); // Son 7 gün
      const total = stats.reduce((acc, curr) => acc + curr.total_focus_minutes, 0);
      setTotalFocus(total);
    };
    fetchStats();
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen className="analytics-page">
        <div className="analytics-container fade-in">
          {/* Nature Background */}
          <div className="nature-bg">
            <div className="leaf leaf-1">🍃</div>
            <div className="leaf leaf-2">🍂</div>
            <div className="leaf leaf-3">🌿</div>
            <div className="leaf leaf-4">🍃</div>
            <div className="leaf leaf-5">🌱</div>
          </div>

          <h1 className="analytics-title">Ormanın Bilgeliği 🌳</h1>
          <p className="analytics-subtitle">Son 7 günlük orman keşiflerin</p>
          
          <div className="stats-highlight-card glow">
            <h3>Bu Hafta Toplanan Odak 🍃</h3>
            <h2>{totalFocus} dk</h2>
          </div>

          <div className="chart-placeholder">
            <WeeklyBarChart />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AnalyticsPage;

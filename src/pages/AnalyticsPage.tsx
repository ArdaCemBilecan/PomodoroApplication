import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { database } from '../core/capacitor/Database';
import MonthlyHeatmap from '../features/analytics/components/MonthlyHeatmap';
import './AnalyticsPage.css';

const AnalyticsPage: React.FC = () => {
  const [totalFocus, setTotalFocus] = useState(0);

  useEffect(() => {
    // Initial fetch of some stats to show
    const fetchStats = async () => {
      const stats = await database.getDailyStats(31); // Son 31 gün (aylık)
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

          <h1 className="analytics-title">Forest Wisdom 🌳</h1>
          <p className="analytics-subtitle">Your forest explorations this month</p>
          
          <div className="stats-highlight-card glow">
            <h3>Focus Gathered This Month 🍃</h3>
            <h2>{totalFocus} min</h2>
          </div>

          <div className="chart-placeholder">
            <MonthlyHeatmap />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AnalyticsPage;

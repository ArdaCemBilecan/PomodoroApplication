import { 
  IonApp, 
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { timerOutline, barChartOutline } from 'ionicons/icons';
import { useEffect } from 'react';

/* Pages */
import TimerPage from './pages/TimerPage';
import AnalyticsPage from './pages/AnalyticsPage';

/* Core init */
import { database } from './core/capacitor/Database';
import { backgroundTimer } from './core/capacitor/BackgroundTimer';
import { audioEngine } from './core/capacitor/AudioEngine';
import { initDBSync } from './stores/dbSync';
import { AdService } from './core/capacitor/AdService';
import RadioPlayer from './features/audio/components/RadioPlayer';

const App: React.FC = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        await database.initialize();
        await backgroundTimer.initialize();
        audioEngine.initialize();
        initDBSync();
        await AdService.initialize();
        console.log('[App] All services initialized');
        
        // Show App Open Ad
        setTimeout(() => {
          AdService.showAppOpenAd();
        }, 1000); // Slight delay for UI to paint
      } catch (error) {
        console.error('[App] Initialization failed:', error);
      }
    };
    initApp();
  }, []);

  return (
    <IonApp>
      <RadioPlayer />
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/timer" component={TimerPage} />
            <Route exact path="/analytics" component={AnalyticsPage} />
            <Route exact path="/">
              <Redirect to="/timer" />
            </Route>
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom" className="app-tab-bar">
            <IonTabButton tab="timer" href="/timer">
              <IonIcon icon={timerOutline} />
              <IonLabel>Timer</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="analytics" href="/analytics">
              <IonIcon icon={barChartOutline} />
              <IonLabel>Analytics</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

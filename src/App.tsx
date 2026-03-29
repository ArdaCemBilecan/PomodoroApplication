import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { useEffect } from 'react';

/* Pages */
import TimerPage from './pages/TimerPage';

/* Core init */
import { database } from './core/capacitor/Database';
import { backgroundTimer } from './core/capacitor/BackgroundTimer';
import { audioEngine } from './core/capacitor/AudioEngine';
import { initDBSync } from './stores/dbSync';

const App: React.FC = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        await database.initialize();
        await backgroundTimer.initialize();
        audioEngine.initialize();
        initDBSync();
        console.log('[App] All services initialized');
      } catch (error) {
        console.error('[App] Initialization failed:', error);
      }
    };
    initApp();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/timer" component={TimerPage} />
          <Route exact path="/">
            <Redirect to="/timer" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

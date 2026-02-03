import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashView from './views/SplashView';
import SafetyCheckView from './views/SafetyCheckView';
import MainLogView from './views/MainLogView';
import EndShiftView from './views/EndShiftView';

/**
 * RSK Digital Site Diary - Main Application
 *
 * Linear Navigation Flow:
 * 1. Splash Screen
 * 2. Safety Check
 * 3. Main Activity Log
 * 4. End Shift (TODO)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashView />} />
        <Route path="/safety-check" element={<SafetyCheckView />} />
        <Route path="/main-log" element={<MainLogView />} />
        <Route path="/end-shift" element={<EndShiftView />} />
        {/* Redirect unknown routes to splash */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

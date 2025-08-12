import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import SettingsModal from './components/SettingsModal';
import { ToastProvider } from './components/ui/ToastProvider';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ChatPage from './pages/ChatPage';
import EnhancedHome from './pages/EnhancedHome';
import GraphPage from './pages/GraphPage';
import History from './pages/History';
import LoginPage from './pages/LoginPage';
import PerfPage from './pages/PerfPage';
import RefactorPage from './pages/RefactorPage';
import SecurityPage from './pages/SecurityPage';
import Settings from './pages/Settings';
import StylePage from './pages/StylePage';
import TestGenPage from './pages/TestGenPage';
import { ThemeProvider } from './styles/theme';
import './styles/tokens.css';
import './styles/motion.css';
import './styles/components.css';
import './index.css';

function NotFound() {
  return (
    <Layout>
      <div className="p-4">
        <h1 className="font-bold text-xl">Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </Layout>
  );
}

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Protected><Layout><EnhancedHome /></Layout></Protected>} />
              <Route path="/history" element={<Protected><Layout><History /></Layout></Protected>} />
              <Route path="/settings" element={<Protected><Layout><Settings /></Layout></Protected>} />
              <Route path="/security" element={<Protected><Layout><SecurityPage /></Layout></Protected>} />
              <Route path="/style" element={<Protected><Layout><StylePage /></Layout></Protected>} />
              <Route path="/test-gen" element={<Protected><Layout><TestGenPage /></Layout></Protected>} />
              <Route path="/performance" element={<Protected><Layout><PerfPage /></Layout></Protected>} />
              <Route path="/refactor" element={<Protected><Layout><RefactorPage /></Layout></Protected>} />
              <Route path="/graph" element={<Protected><Layout><GraphPage /></Layout></Protected>} />
              <Route path="/chat" element={<Protected><Layout><ChatPage /></Layout></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

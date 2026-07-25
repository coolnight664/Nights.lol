import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { PublicBioPage } from './components/PublicBioPage';
import { LoginPage } from './components/LoginPage';

function ProtectedRoute({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function BioPageRoute() {
  const { username } = useParams();
  return <PublicBioPage username={username} />;
}

function AppPage() {
  const { currentUser, loginWithDiscordData } = useApp();
  const [searchParams] = useSearchParams();
  const [appTab, setAppTab] = useState('dashboard');
  const isOwner = currentUser?.id === '1530317959661228162' || currentUser?.isOwner;

  useEffect(() => {
    const discordData = searchParams.get('discord');
    if (discordData && !currentUser) {
      const params = new URLSearchParams(discordData);
      const id = params.get('id');
      const username = params.get('username');
      const avatar = params.get('avatar');
      const discriminator = params.get('discriminator');
      if (id && username) {
        loginWithDiscordData(id, username, avatar, discriminator);
        window.history.replaceState({}, '', '/app');
      }
    }
  }, [searchParams]);

  if (appTab === 'bio') {
    return <PublicBioPage username={currentUser?.siteUsername || 'owner'} />;
  }

  return (
    <div className="min-h-screen bg-nights-950 text-gray-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      <Navbar appTab={appTab} setAppTab={setAppTab} />
      <main className="flex-1 pt-14">
        {appTab === 'dashboard' && <Dashboard />}
        {appTab === 'admin' && isOwner && <AdminPanel />}
      </main>
    </div>
  );
}

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithDiscordData } = useApp();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const discordData = searchParams.get('discord');
    if (discordData) {
      const params = new URLSearchParams(discordData);
      const id = params.get('id');
      const username = params.get('username');
      const avatar = params.get('avatar');
      const discriminator = params.get('discriminator');
      if (id && username) {
        loginWithDiscordData(id, username, avatar, discriminator);
        window.history.replaceState({}, '', '/app');
        setStatus('Redirecting...');
      } else {
        setStatus('Failed to parse Discord data');
      }
    } else {
      setStatus('No Discord data found');
    }
  }, []);

  return (
    <div className="min-h-screen bg-nights-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-gray-400 font-mono">{status}</p>
      </div>
    </div>
  );
}

function LandingLayout() {
  return (
    <div className="min-h-screen bg-nights-950 text-gray-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      <Navbar />
      <main className="flex-1 pt-14">
        <LandingPage />
      </main>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/discord/callback" element={<OAuthCallback />} />
      <Route path="/" element={<LandingLayout />} />
      <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
      <Route path="/:username" element={<BioPageRoute />} />
    </Routes>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import MegazineReader from './pages/MegazineReader';
import HorizontalLanding from './components/Megazine/HorizontalLanding';
import { Volume } from './types';
import { VOLUME_SEED } from './content/volumes';

import PageBuilder from './components/CMS/PageBuilder';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedVolIdx, setSelectedVolIdx] = useState(0);

  // Load volumes from storage
  const loadVolumes = () => {
    const saved = localStorage.getItem('kd_volumes');
    if (saved) return JSON.parse(saved);
    return [...VOLUME_SEED];
  };

  const [volumes, setVolumes] = useState<Volume[]>(loadVolumes);

  // Re-sync volumes when window gains focus or on storage events (helper for multi-tab or builder return)
  useEffect(() => {
    const handleStorageChange = () => setVolumes(loadVolumes());
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleEnter = (volIdx: number) => {
    // Prevent entering if not published?
    // Intro component will handle the UI state (locking).
    // Here we just accept the index. 
    // BUT we need to make sure the volume exists in our state.
    // If it doesn't exist (e.g. Vol 2 is draft or not in array), we might need to handle it.
    // However, Intro will likely only allow clicking valid ones.
    setSelectedVolIdx(volIdx);
    setShowIntro(false);
  };

  if (showIntro) {
    return <HorizontalLanding onEnter={handleEnter} availableVolumes={volumes} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MegazineReader volumes={volumes} initialVolIdx={selectedVolIdx} onBack={() => setShowIntro(true)} />} />
        <Route path="/krackedmin-admin" element={<PageBuilder />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

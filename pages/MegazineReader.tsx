
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Volume, resolveTheme } from '../types';
import Book from '../components/Megazine/Book';
import VolumeSelector from '../components/Megazine/VolumeSelector';

interface MegazineReaderProps {
  volumes: Volume[];
  initialVolIdx?: number;
  onBack: () => void;
}

const MegazineReader: React.FC<MegazineReaderProps> = ({ volumes, initialVolIdx = 0, onBack }) => {
  const [currentVolume, setCurrentVolume] = useState<Volume>(() => {
    const vol = volumes[initialVolIdx] || volumes[0];
    const idx = volumes.indexOf(vol);
    const theme = resolveTheme(vol, idx);
    return { ...vol, themeColor: theme.accent, theme };
  });

  const handleSelectVolume = (id: string) => {
    const v = volumes.find(vol => vol.id === id);
    if (v) {
      const idx = volumes.indexOf(v);
      const theme = resolveTheme(v, idx);
      setCurrentVolume({ ...v, themeColor: theme.accent, theme });
    }
  };

  const theme = currentVolume.theme || resolveTheme(currentVolume, 0);
  const themeColor = theme.accent;

  if (!currentVolume) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center text-[#c8c0b2] kd-caps tracking-[0.5em] uppercase">
        Archive node not found
      </div>
    );
  }

  return (
    <div className={`relative w-screen h-screen overflow-hidden theme-bg theme-${theme.variant} flex items-center justify-center`}>
      {/* Animated themed backdrop */}
      <div className="kd-theme-bg" />

      {/* Subtle themed paper texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
           style={{ backgroundImage: `radial-gradient(circle, ${themeColor} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

      {/* TOP LEFT: Back to main page */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 z-[200] group flex flex-col gap-1 items-start"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-[1px] bg-[#e6dfd8] group-hover:w-10 transition-all" style={{ backgroundColor: themeColor }} />
          <span className="kd-caps text-[10px] text-[#8e8b82] group-hover:text-[#141413] transition-colors tracking-[0.3em]">Back to Origin</span>
        </div>
        <div className="text-[8px] text-[#c8c0b2] font-mono uppercase pl-8 group-hover:text-[#8e8b82]">Protocol_Exit</div>
      </button>

      {/* TOP RIGHT: Volume Badge */}
      <div className="absolute top-8 right-8 z-[200]">
        <div className="kd-caps px-4 py-2 border text-xs tracking-[0.2em] rounded-full transition-colors duration-500"
             style={{ borderColor: themeColor, color: themeColor }}>
          VOL {currentVolume.volume}
        </div>
      </div>

      <motion.div
        key={currentVolume.id}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full flex items-center justify-center"
      >
        <Book volume={currentVolume} />
      </motion.div>

      <VolumeSelector
        volumes={volumes}
        currentId={currentVolume.id}
        onSelect={handleSelectVolume}
      />

      <div className="fixed bottom-8 right-12 kd-caps text-[10px] tracking-[0.4em] opacity-40 kd-glow font-medium italic transition-colors duration-500"
           style={{ color: themeColor }}>
        @RIKAYUWILZAM · KRACKED DEVS
      </div>
    </div>
  );
};

export default MegazineReader;

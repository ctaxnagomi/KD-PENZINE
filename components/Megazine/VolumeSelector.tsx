import React from 'react';
import { Volume, resolveTheme } from '../../types';

interface VolumeSelectorProps {
  volumes: Volume[];
  currentId: string;
  onSelect: (id: string) => void;
}

const VolumeSelector: React.FC<VolumeSelectorProps> = ({ volumes, currentId, onSelect }) => {
  const currentIdx = volumes.findIndex((v) => v.id === currentId);
  const currentVol = volumes[currentIdx];
  const currentAccent = currentVol ? resolveTheme(currentVol, currentIdx).accent : '#cc785c';

  return (
    <nav className="fixed top-20 right-8 z-50 flex flex-col items-end gap-2" aria-label="Volume selection">
      <div className="flex items-center gap-2 kd-caps text-[8px] tracking-[0.3em] text-[#8e8b82]">
        <span className="w-4 h-px" style={{ backgroundColor: currentAccent }} />
        <span>Archive</span>
        <span className="opacity-60">{volumes.length} nodes</span>
      </div>

      <div className="flex flex-wrap justify-end gap-1.5 max-w-[320px] md:max-w-none">
        {volumes.map((v, i) => {
          const accent = resolveTheme(v, i).accent;
          const isActive = v.id === currentId;
          const isDraft = v.status === 'draft';
          return (
            <button
              key={v.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(v.id);
              }}
              title={`${v.title}${isDraft ? ' · draft' : ''}`}
              className={`
                kd-vol-pill kd-caps relative px-3 py-1.5 text-[9px] tracking-[0.15em] border rounded-full transition-all duration-300 active:scale-95
                ${isActive
                  ? 'text-white scale-[1.06]'
                  : 'bg-[#faf9f5]/80 border-[#e6dfd8] text-[#6c6a64] hover:scale-[1.05]'}
                ${isDraft ? 'border-dashed opacity-70' : ''}
              `}
              style={isActive
                ? { backgroundColor: accent, borderColor: accent, boxShadow: `0 0 0 1px ${accent}, 0 0 18px ${accent}59` }
                : ({ '--kd-accent': accent } as React.CSSProperties)}
            >
              <span className="flex items-center gap-1.5">
                <span className={`rounded-full flex-shrink-0 ${isActive ? 'w-1.5 h-1.5 bg-white/90' : 'w-1 h-1 bg-[#c8c0b2]'}`} />
                VOL {String(v.volume).padStart(2, '0')}
              </span>
              {isActive && <span className="kd-pulse-dot kd-pulse-dot--light absolute -top-1 -right-1" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default VolumeSelector;

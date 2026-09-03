import React, { useEffect, useRef, useState } from 'react';
import { Volume, resolveTheme } from '../../types';

interface VolumeSelectorProps {
  volumes: Volume[];
  currentId: string;
  onSelect: (id: string) => void;
}

const VolumeSelector: React.FC<VolumeSelectorProps> = ({ volumes, currentId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

  const currentIdx = volumes.findIndex((v) => v.id === currentId);
  const currentVol = volumes[currentIdx];
  const currentAccent = currentVol ? resolveTheme(currentVol, currentIdx).accent : '#cc785c';

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (id: string) => {
    setOpen(false);
    onSelect(id);
  };

  return (
    <nav
      ref={rootRef}
      className="fixed top-20 right-8 z-50 flex flex-col items-end"
      aria-label="Volume selection"
    >
      {/* Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="kd-caps flex items-center gap-2 px-3.5 py-2 text-[9px] tracking-[0.25em] rounded-full border bg-[#faf9f5]/85 backdrop-blur-md transition-all duration-300 active:scale-95"
        style={{
          borderColor: open ? currentAccent : 'rgba(230,223,216,0.7)',
          color: open ? currentAccent : '#6c6a64',
          boxShadow: open ? `0 0 0 1px ${currentAccent}55, 0 8px 28px rgba(20,20,19,0.10)` : '0 2px 10px rgba(20,20,19,0.05)',
        }}
      >
        <span className="w-3 h-px" style={{ backgroundColor: currentAccent }} />
        <span>Archive</span>
        <span className="opacity-60">{volumes.length} nodes</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M1 2.5 L4 5.5 L7 2.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          role="listbox"
          className="mt-2 w-[min(264px,calc(100vw-4rem))] overflow-hidden rounded-2xl border bg-[#faf9f5]/90 backdrop-blur-xl shadow-[0_18px_50px_rgba(20,20,19,0.16)]"
          style={{ borderColor: 'rgba(230,223,216,0.8)' }}
        >
          <div className="max-h-[52vh] overflow-y-auto overscroll-contain py-1.5 kd-swarm-in">
            {volumes.map((v, i) => {
              const accent = resolveTheme(v, i).accent;
              const isActive = v.id === currentId;
              const isDraft = v.status === 'draft';
              return (
                <button
                  key={v.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(v.id);
                  }}
                  title={`${v.title}${isDraft ? ' · draft' : ''}`}
                  className="kd-swarm-item w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-200 hover:bg-black/[0.04] active:bg-black/[0.06]"
                  style={isActive ? { backgroundColor: `${accent}14` } : undefined}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-9 h-6 kd-caps text-[9px] tracking-[0.1em] rounded-md border transition-colors duration-200"
                    style={
                      isActive
                        ? { backgroundColor: accent, borderColor: accent, color: '#fff' }
                        : { borderColor: 'rgba(230,223,216,0.9)', color: '#8e8b82' }
                    }
                  >
                    V{String(v.volume).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[11px] leading-tight font-medium" style={{ color: isActive ? '#141413' : '#4a4843' }}>
                      {v.title}
                    </span>
                    <span className="block text-[9px] tracking-[0.08em] kd-caps mt-0.5" style={{ color: isActive ? accent : '#a8a49a' }}>
                      {v.date}
                      {isDraft ? ' · draft' : ''}
                    </span>
                  </span>
                  {isActive && (
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default VolumeSelector;

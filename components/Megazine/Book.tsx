
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Volume } from '../../types';
import Page from './Page';
import useHandTracking from './useHandTracking';

interface BookProps {
  volume: Volume;
}

const Book: React.FC<BookProps> = ({ volume }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const flipTimeout = useRef<number | null>(null);
  const startX = useRef(0);
  const themeColor = volume.themeColor || '#cc785c';

  const volumeData = useMemo(() => ({
    id: volume.id,
    title: volume.title,
    pages: volume.pages
  }), [volume]);

  const isAtEnd = currentPage === volumeData.pages.length - 1;
  const totalPages = volumeData.pages.length;

  useEffect(() => {
    setCurrentPage(0);
  }, [volumeData.id]);

  const playTurnSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.08;
    audio.play().catch(() => {});
  }, []);

  const goToPage = useCallback((target: number) => {
    if (isFlipping) return;
    if (target === currentPage) return;
    if (target < 0 || target >= totalPages) return;
    setIsFlipping(true);
    playTurnSound();

    setTimeout(() => {
      setCurrentPage(target);
    }, 400);

    if (flipTimeout.current) window.clearTimeout(flipTimeout.current);
    flipTimeout.current = window.setTimeout(() => setIsFlipping(false), 900);
  }, [currentPage, totalPages, isFlipping, playTurnSound]);

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

  const handleStart = (clientX: number) => {
    if (isFlipping) return;
    startX.current = clientX;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    setDragX(clientX - startX.current);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    const threshold = 100;
    if (dragX < -threshold) nextPage();
    else if (dragX > threshold) prevPage();

    setIsDragging(false);
    setDragX(0);
  };

  const resetToCover = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(0);
      setIsFlipping(false);
    }, 600);
  };

  const hand = useHandTracking({ onSwipeLeft: nextPage, onSwipeRight: prevPage });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  const handPillClass = hand.enabled
    ? 'kd-hand-pill kd-hand-pill--on'
    : hand.status === 'error'
      ? 'kd-hand-pill kd-hand-pill--error'
      : 'kd-hand-pill';

  return (
    <div
      className={`relative w-[95vw] md:w-[65vw] lg:w-[55vw] h-[80vh] md:h-[85vh] perspective-2000 select-none group outline-none transition-transform duration-700 ${isFlipping ? 'scale-95' : 'scale-100'}`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onWheel={(e) => {
        if (Math.abs(e.deltaY) < 30) return;
        if (e.deltaY > 0) nextPage();
        else prevPage();
      }}
    >
      {isAtEnd && (
        <div className="absolute -right-4 md:-right-72 top-1/2 -translate-y-1/2 w-48 md:w-80 z-[600] pointer-events-auto animate-wipe-in">
          <div className="text-white p-6 md:p-10 rounded-[12px] rotate-1 shadow-[0_24px_50px_rgba(20,20,19,0.3)]" style={{ backgroundColor: themeColor }}>
            <h3 className="kd-caps text-[10px] md:text-sm tracking-[0.3em] mb-2 md:mb-4">Archive Depleted</h3>
            <p className="text-[9px] md:text-[11px] font-medium opacity-80 leading-relaxed mb-4 md:mb-8">
              Access restricted. Return to origin.
            </p>
            <button
              onClick={resetToCover}
              className="w-full py-3 md:py-5 bg-[#181715] text-white kd-caps text-[10px] md:text-[12px] tracking-[0.3em] hover:bg-[#252320] active:scale-95 transition-all rounded-[8px]"
            >
              Restart?
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full h-full preserve-3d">
        {volumeData.pages.map((content, idx) => (
          <Page
            key={`${volumeData.id}-${idx}`}
            index={idx}
            total={totalPages}
            current={currentPage}
            content={content}
            volume={volume}
            dragX={idx === currentPage ? (dragX < 0 ? dragX : 0) : 0}
            isDragging={isDragging}
            isFlipping={isFlipping}
          />
        ))}
      </div>

      <div
        className="absolute bottom-[-50px] md:bottom-[-70px] left-0 w-full flex items-end justify-between px-4 md:px-8 opacity-40 group-hover:opacity-100 transition-all duration-500"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <span className="text-[7px] md:text-[9px] text-[#8e8b82] tracking-[0.6em] uppercase font-mono">REF_{currentPage}</span>
          <span className="kd-display text-[10px] md:text-[13px] uppercase tracking-widest kd-flicker italic transition-colors duration-500" style={{ color: themeColor }}>
            Archive // {volumeData.title}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pb-0.5">
          <button
            aria-label="Previous page"
            className="kd-ctrl-btn"
            disabled={currentPage === 0 || isFlipping}
            onClick={prevPage}
          >
            ‹
          </button>
          <span className="kd-caps text-[8px] md:text-[10px] text-[#8e8b82] tracking-[0.2em] min-w-[52px] text-center">
            {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
          <button
            aria-label="Next page"
            className="kd-ctrl-btn"
            disabled={isAtEnd || isFlipping}
            onClick={nextPage}
          >
            ›
          </button>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="kd-video-holder">
            <video
              ref={hand.videoRef}
              className={hand.enabled || hand.status === 'loading' ? 'kd-hand-video' : 'kd-hand-video hidden'}
              muted
              playsInline
            />
            {hand.enabled && hand.handPos && (
              <span
                className="kd-hand-pointer"
                style={{ left: `${(1 - hand.handPos.x) * 100}%`, top: `${hand.handPos.y * 100}%` }}
              />
            )}
          </div>
          <button className={handPillClass} onClick={hand.toggle} disabled={!hand.supported} title={hand.errorMsg || undefined}>
            <span className={`kd-hand-dot ${hand.enabled ? 'kd-hand-dot--live' : ''}`} />
            <span>
              {hand.status === 'loading' ? 'Starting'
                : hand.status === 'calibrating' ? 'Calibrating…'
                : hand.status === 'error' ? 'Error'
                : hand.enabled ? 'Hand on'
                : hand.supported ? 'Hand off' : 'No camera'}
            </span>
          </button>
        </div>
      </div>

      {hand.enabled && (
        <div className="absolute bottom-[-96px] md:bottom-[-116px] right-4 md:right-8 flex items-center gap-2">
          {hand.status === 'on' ? (
            <>
              <span className="kd-hotspot kd-hotspot--calm" />
              <span className="text-[7px] md:text-[8px] text-[#8e8b82] kd-caps tracking-[0.25em]">
                Wave to flip · left = next · right = back
              </span>
            </>
          ) : (
            <>
              <span className="kd-hotspot" />
              <span className="text-[7px] md:text-[8px] text-[#8e8b82] kd-caps tracking-[0.25em]">
                Raise your hand to calibrate
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Book;

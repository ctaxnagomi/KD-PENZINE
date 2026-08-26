
import React, { useMemo } from 'react';
import { Volume } from '../../types';

interface PageProps {
  index: number;
  total: number;
  current: number;
  content: string;
  volume: Volume;
  dragX?: number;
  isDragging?: boolean;
  isFlipping?: boolean;
}

interface Block {
  type: string;
  text?: string;
  url?: string;
  alt?: string;
  caption?: string;
  n?: number;
  bold?: boolean;
  videoId?: string;
}

const Page: React.FC<PageProps> = ({ index, total, current, content, volume, dragX = 0, isDragging = false, isFlipping = false }) => {
  const isActive = index === current;
  const isFlipped = index < current;
  const isUpcoming = index === current + 1;
  const themeColor = volume.themeColor || '#cc785c';

  const shouldRender = Math.abs(index - current) <= 1;
  if (!shouldRender) return null;

  let rotationY = isFlipped ? -180 : 0;
  if (isActive && isDragging && dragX < 0) {
    const dragRotation = (dragX / 450) * -180;
    rotationY = Math.max(-180, dragRotation);
  }

  const revealProgress = Math.abs(rotationY) / 180;
  const opacity = isUpcoming
    ? (isDragging || isFlipping ? Math.min(1, revealProgress * 6) : 0)
    : 1;

  let pageScale = 1;
  if (isActive && isFlipping) pageScale = 0.98;
  if (isUpcoming && isFlipping) pageScale = 1.02;

  const fontSizeScale = useMemo(() => {
    if (!volume.layout?.autoFit) return 0.85;
    const charCount = content.length;
    const isMobile = window.innerWidth < 768;
    const base = isMobile ? 0.75 : 0.9;

    if (charCount > 4000) return base * 0.38;
    if (charCount > 3000) return base * 0.42;
    if (charCount > 2000) return base * 0.55;
    if (charCount > 1200) return base * 0.70;
    if (charCount > 600) return base * 0.85;
    return base;
  }, [content, volume.layout?.autoFit]);

  const parseYouTubeId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  const parseLine = (line: string): any => {
    let trimmed = line.trim();
    const hasBold = trimmed.includes('**');
    if (hasBold) {
      trimmed = trimmed.replace(/\*\*/g, '');
    }

    if (trimmed === '') return { type: 'spacer' };
    if (trimmed.startsWith('# ')) return { type: 'h1', text: trimmed.replace('# ', '') };
    if (trimmed.startsWith('## ')) return { type: 'h2', text: trimmed.replace('## ', '') };
    if (trimmed.startsWith('### ')) return { type: 'h3', text: trimmed.replace('### ', '') };
    if (trimmed.startsWith('- ')) return { type: 'li', text: trimmed.replace('- ', '') };

    if (trimmed.startsWith('![') && trimmed.includes('](')) {
      const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) return { type: 'figure', url: match[2], alt: match[1], caption: '' };
    }

    if (trimmed.startsWith('[FIGURE:')) {
      const inner = trimmed.replace('[FIGURE:', '').replace(']', '').trim();
      const parts = inner.split('|');
      return {
        type: 'figure',
        url: (parts[0] || '').trim(),
        alt: (parts[1] || 'Figure').trim(),
        caption: parts.slice(2).join('|').trim(),
      };
    }

    if (trimmed.startsWith('[CAPTION:')) {
      return { type: 'caption', text: trimmed.replace('[CAPTION:', '').replace(']', '').trim() };
    }

    if (trimmed.startsWith('[DATELINE:')) {
      return { type: 'dateline', text: trimmed.replace('[DATELINE:', '').replace(']', '').trim() };
    }

    if (trimmed.startsWith('[ABSTRACT:')) {
      return { type: 'abstract', text: trimmed.replace('[ABSTRACT:', '').replace(']', '').trim() };
    }

    if (trimmed.startsWith('[MARGIN:')) {
      return { type: 'margin', text: trimmed.replace('[MARGIN:', '').replace(']', '').trim() };
    }

    if (trimmed.startsWith('[VIDEO:')) {
      const url = trimmed.replace('[VIDEO:', '').replace(']', '').trim();
      const videoId = parseYouTubeId(url);
      return { type: 'video', url, videoId };
    }

    return { type: 'p', text: trimmed, bold: hasBold };
  };

  const buildBlocks = (): Block[] => {
    const lines = content.split('\n');
    const blocks: Block[] = [];
    let sectionNum = 0;
    let figureNum = 0;
    let pendingFigure: Block | null = null;

    const flushFigure = () => {
      if (pendingFigure) {
        figureNum += 1;
        blocks.push({ ...pendingFigure, type: 'figure', n: figureNum });
        pendingFigure = null;
      }
    };

    for (const line of lines) {
      const p = parseLine(line);
      switch (p.type) {
        case 'spacer': flushFigure(); blocks.push({ type: 'spacer' }); break;
        case 'h1': flushFigure(); blocks.push({ type: 'title', text: p.text }); break;
        case 'h2': flushFigure(); sectionNum += 1; blocks.push({ type: 'section', text: p.text, n: sectionNum }); break;
        case 'h3': flushFigure(); blocks.push({ type: 'subsection', text: p.text }); break;
        case 'li': flushFigure(); blocks.push({ type: 'list', text: p.text }); break;
        case 'figure': flushFigure(); pendingFigure = { type: 'figure', url: p.url, alt: p.alt, caption: p.caption || '' }; break;
        case 'caption':
          if (pendingFigure) {
            pendingFigure.caption = p.text;
          }
          break;
        case 'dateline': flushFigure(); blocks.push({ type: 'dateline', text: p.text }); break;
        case 'abstract': flushFigure(); blocks.push({ type: 'abstract', text: p.text }); break;
        case 'margin': flushFigure(); blocks.push({ type: 'margin', text: p.text }); break;
        case 'video': flushFigure(); blocks.push({ type: 'video', url: p.url, videoId: p.videoId }); break;
        default: flushFigure(); blocks.push({ type: 'p', text: p.text, bold: p.bold }); break;
      }
    }
    flushFigure();
    return blocks;
  };

  const blocks = useMemo(buildBlocks, [content]);

  const renderBlock = (b: Block, i: number) => {
    switch (b.type) {
      case 'spacer':
        return <div key={i} className="h-2 md:h-3" />;

      case 'title':
        return (
          <h1 key={i} className="kd-display text-2xl md:text-[2.1em] font-semibold leading-tight mb-3 md:mb-4 break-inside-avoid" style={{ color: themeColor }}>
            {b.text}
          </h1>
        );

      case 'section':
        return (
          <div key={i} className="flex items-center gap-2.5 mb-2 md:mb-3 mt-4 break-inside-avoid">
            <span className="kd-display text-sm md:text-lg italic" style={{ color: themeColor }}>
              {String(b.n || 0).padStart(2, '0')}
            </span>
            <h2 className="kd-caps text-[10px] md:text-[11px] font-semibold tracking-[0.18em] uppercase text-[#141413]">{b.text}</h2>
            <span className="flex-1 h-px" style={{ background: `${themeColor}30` }} />
          </div>
        );

      case 'subsection':
        return (
          <h3 key={i} className="kd-caps text-[8px] md:text-[9px] font-semibold mb-2 text-[#6c6a64] tracking-[0.2em] flex items-center gap-2 break-inside-avoid">
            <span className="w-1 h-1 rotate-45 flex-shrink-0" style={{ backgroundColor: themeColor }} /> {b.text}
          </h3>
        );

      case 'list':
        return (
          <div key={i} className="flex items-start gap-2 md:gap-3 mb-1.5 md:mb-2 break-inside-avoid">
            <div className="mt-[0.55em] w-1 h-1 rotate-45 opacity-60 flex-shrink-0" style={{ backgroundColor: themeColor }} />
            <span className="text-[#3d3d3a] text-[9px] md:text-xs leading-tight font-medium">{b.text}</span>
          </div>
        );

      case 'figure':
        return (
          <figure key={i} className="my-3 md:my-4 break-inside-avoid">
            {b.url ? (
              <img
                src={b.url}
                alt={b.alt || 'figure'}
                loading="lazy"
                decoding="async"
                className="w-full max-h-56 object-cover rounded-[4px]"
              />
            ) : (
              <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-[4px] flex flex-col items-center justify-center py-6 gap-1">
                <div className="kd-caps text-[6px] md:text-[7px] text-[#8e8b82]">No image</div>
              </div>
            )}
            {b.caption && (
              <figcaption className="flex items-start gap-2 mt-1.5 break-inside-avoid">
                <span className="kd-caps text-[7px] font-semibold flex-shrink-0" style={{ color: themeColor }}>
                  {b.n ? `Fig ${b.n}` : ''}
                </span>
                <span className="text-[7px] md:text-[8px] text-[#6c6a64] leading-snug">{b.caption}</span>
              </figcaption>
            )}
          </figure>
        );

      case 'dateline':
        return (
          <div key={i} className="flex items-center gap-2 mb-3 break-inside-avoid">
            <span className="w-1 h-1 rotate-45 flex-shrink-0" style={{ backgroundColor: themeColor }} />
            <span className="kd-caps text-[8px] tracking-[0.25em] text-[#6c6a64]">{b.text}</span>
            <span className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${themeColor}40, transparent)` }} />
          </div>
        );

      case 'abstract':
        return (
          <div key={i} className="my-3 border-l-2 pl-3 py-1 break-inside-avoid" style={{ borderColor: themeColor }}>
            <span className="kd-caps text-[7px] tracking-[0.3em] text-[#8e8b82] block mb-1">Abstract</span>
            <p className="text-[8px] md:text-[10px] text-[#3d3d3a] italic leading-relaxed">{b.text}</p>
          </div>
        );

      case 'margin':
        return (
          <div key={i} className="my-2 border-l py-0.5 pl-2 break-inside-avoid" style={{ borderColor: `${themeColor}66` }}>
            <span className="text-[7px] md:text-[8px] text-[#6c6a64] leading-snug italic">{b.text}</span>
          </div>
        );

      case 'video':
        if (!b.videoId) {
          return (
            <div key={i} className="my-3 bg-[#efe9de] border border-[#e6dfd8] rounded-[4px] p-4 text-center break-inside-avoid">
              <span className="kd-caps text-[7px] text-[#8e8b82]">Invalid video URL</span>
            </div>
          );
        }
        return (
          <div key={i} className="my-3 md:my-4 break-inside-avoid">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${b.videoId}`}
                title={b.alt || 'Video'}
                className="absolute inset-0 w-full h-full rounded-[4px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        );

      default:
        return (
          <p key={i} className={`text-[#3d3d3a] text-[9px] md:text-xs mb-2 md:mb-3 leading-snug font-normal text-justify break-words ${b.bold ? 'font-semibold text-[#141413]' : ''}`}>
            {b.text}
          </p>
        );
    }
  };

  const showRail = window.innerWidth >= 1024;
  const marginNotes = showRail ? blocks.filter((b) => b.type === 'margin') : [];

  return (
    <div
      className="absolute inset-0 preserve-3d kd-page-flip"
      style={{
        zIndex: isActive ? 100 : (isUpcoming ? 50 : 150),
        transformOrigin: 'left center',
        transform: `rotateY(${rotationY}deg) scale(${pageScale})`,
        backfaceVisibility: 'hidden',
        pointerEvents: isActive ? 'auto' : 'none',
        opacity,
        visibility: opacity === 0 ? 'hidden' : 'visible',
      }}
    >
      <div className="kd-paper absolute inset-0 bg-[#faf9f5] border border-[#e6dfd8] overflow-hidden rounded-r-[6px] shadow-[inset_0_0_80px_rgba(20,20,19,0.06)] flex flex-col preserve-3d">
        <div className="absolute left-0 top-0 bottom-0 w-10 md:w-16 bg-gradient-to-r from-[#e8e0d2]/80 via-transparent to-transparent z-20 pointer-events-none" />

        {index === 0 ? (
          <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
            <div className="relative">
              <div className="kd-caps text-[8px] md:text-[10px] tracking-[0.45em] text-[#8e8b82] mb-4 md:mb-6">Est. 2026 · Neural Editorial</div>
              <h1
                className="kd-display font-semibold uppercase leading-[0.92] text-5xl md:text-[7.5rem] tracking-tight"
                style={{ color: themeColor, textShadow: `0 0 40px ${themeColor}33` }}
              >
                Kracked<br />Devs
              </h1>
              <div
                className="kd-caps absolute -top-3 -right-4 md:-right-10 text-[7px] md:text-[9px] text-white px-2.5 py-1 rounded-full rotate-6"
                style={{ backgroundColor: themeColor }}
              >
                Vol {volume.volume || index}
              </div>
            </div>
            <div className="h-px w-40 md:w-64 my-6" style={{ background: `linear-gradient(to right, transparent, ${themeColor}, transparent)` }} />
            <p className="kd-caps text-[9px] md:text-[11px] text-[#3d3d3a] tracking-[0.35em]">{volume.date}</p>
            <p className="mt-2 text-[7px] md:text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: themeColor }}>Node: {volume.title}</p>
            <div className="kd-cover-grid absolute inset-0 pointer-events-none" />
          </div>
        ) : (
          <>
            <header className="relative z-20 flex items-center justify-between px-4 md:px-10 pt-3 md:pt-4 pb-2 border-b border-[#e6dfd8]">
              <span className="kd-caps text-[7px] md:text-[8px] tracking-[0.25em] text-[#8e8b82]">Kracked Devs</span>
              <span className="kd-caps text-[7px] md:text-[8px] tracking-[0.25em]" style={{ color: themeColor }}>{volume.title}</span>
              <span className="kd-caps text-[7px] md:text-[8px] tracking-[0.25em] text-[#8e8b82]">{volume.date}</span>
            </header>

            <div className="relative z-20 flex flex-1 min-h-0 px-4 md:pl-10 md:pr-8 pt-3" style={{ fontSize: `${fontSizeScale}em` }}>
              <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
                <div
                  className="h-full overflow-hidden"
                  style={{
                    columnCount: window.innerWidth < 768 ? 1 : (volume.layout?.newspaperMode ? (volume.layout?.columns || 2) : 1),
                    columnFill: 'auto',
                    columnRule: `1px solid ${themeColor}1f`,
                  }}
                >
                  {blocks.map((b, i) => (b.type === 'margin' ? null : renderBlock(b, i)))}
                </div>
              </main>
              {showRail && (
                <aside className="kd-rail">
                  {marginNotes.length ? marginNotes.map((b, i) => (
                    <div key={i} className="kd-margin-note">{b.text}</div>
                  )) : (
                    <div className="kd-margin-note opacity-50">—</div>
                  )}
                </aside>
              )}
            </div>

            <footer className="relative z-20 flex items-center justify-between px-4 md:px-10 pt-2 pb-3 border-t border-[#e6dfd8]">
              <span className="text-[7px] md:text-[8px] text-[#8e8b82] font-mono">KD_CORE_v2 · {volume.title}</span>
              <span className="kd-caps text-[7px] md:text-[8px] text-[#8e8b82] tracking-[0.3em]">{String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
              <span className="kd-display text-2xl md:text-3xl text-[#e8e0d2] select-none italic">{String(index).padStart(2, '0')}</span>
            </footer>
          </>
        )}

        <div className={`kd-fold ${(isActive && isFlipping) || (isUpcoming && isFlipping) ? 'kd-fold-on' : ''}`} />
      </div>

      <div
        className="absolute inset-0 bg-[#181715] preserve-3d rounded-l-[6px]"
        style={{ transform: 'rotateY(180deg) translateZ(1px)', backfaceVisibility: 'hidden' }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-[#252320] via-[#181715]/40 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#181715]/90 via-transparent to-transparent" />
      </div>
    </div>
  );
};

export default Page;

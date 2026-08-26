
import React, { useState, useEffect } from 'react';
import { Volume, resolveTheme } from '../../types';

interface IntroProps {
  onEnter: (volIndex: number) => void;
  availableVolumes: Volume[];
}

const CAROUSEL_POSTS = [
  'Syncing Neural Protocol...',
  'Vol 1 is officially LIVE.',
  'Malaysia AI scene is heating up!',
  'Spatial agents are the future.',
  'Kracked Devs node initialized.',
  'Check out the new portal.',
  'Community Bounty RM200 open.',
  'Stay Kracked, stay building.',
];

const Intro: React.FC<IntroProps> = ({ onEnter, availableVolumes }) => {
  const [volIndex, setVolIndex] = useState(0);
  const [visitorCount, setVisitorCount] = useState(15);
  const [carouselPosts] = useState<string[]>(CAROUSEL_POSTS);

  const displayVolumes = Array(Math.max(5, availableVolumes.length)).fill(null).map((_, i) => {
    const vol = availableVolumes.find(v => v.volume === i + 1);
    return vol || { volume: i + 1, status: 'draft', title: 'Pending' };
  });

  const theme = resolveTheme(displayVolumes[volIndex], volIndex);
  const themeColor = theme.accent;

  // Visitor Counter: real persistence via countapi.xyz, graceful degradation otherwise
  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const response = await fetch('https://api.countapi.xyz/hit/kracked-devs-penzine-v2/visits');
        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.value);
        } else {
          setVisitorCount(prev => prev + 1);
        }
      } catch (error) {
        setVisitorCount(prev => prev + 1);
      }
    };

    fetchVisitorCount();

    const interval = setInterval(async () => {
      try {
        const response = await fetch('https://api.countapi.xyz/get/kracked-devs-penzine-v2/visits');
        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.value);
        }
      } catch (e) { /* ignore update errors */ }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) setVolIndex(prev => (prev + 1) % displayVolumes.length);
    else setVolIndex(prev => (prev - 1 + displayVolumes.length) % displayVolumes.length);
  };

  const handle = localStorage.getItem('kd_twitter_handle') || '@KrackedDevs';

  return (
    <div className={`fixed inset-0 theme-bg theme-${theme.variant} flex items-center justify-center overflow-hidden z-[1000] font-sans transition-colors duration-1000`} onWheel={handleWheel}>

      {/* Animated themed backdrop */}
      <div className="kd-theme-bg" />

      {/* Faint editorial dot-grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
          <pattern id="kd-dots" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="1.2" fill={themeColor} />
          </pattern>
          <rect width="100%" height="100%" fill="url(#kd-dots)" />
        </svg>
      </div>

      {/* Top Banner: dark editorial ticker */}
      <div className="absolute top-0 left-0 w-full h-16 md:h-20 bg-[#181715] backdrop-blur-md border-b z-[1100] flex items-center overflow-hidden" style={{ borderColor: '#252320' }}>
        <div className="flex animate-scroll-x gap-4 md:gap-6 px-4 md:px-8">
          {[...carouselPosts, ...carouselPosts, ...carouselPosts].map((post, i) => (
            <div key={i} className="flex-shrink-0 w-52 md:w-72 h-10 md:h-12 bg-[#1f1e1b] border border-[#252320] px-3 md:px-4 rounded-[8px] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#252320] border flex items-center justify-center text-[9px] text-[#a09d96]" style={{ borderColor: `${themeColor}66` }}>KD</div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] md:text-[10px] font-medium text-[#faf9f5]">{handle}</span>
                <span className="text-[7px] md:text-[8px] text-[#a09d96] truncate w-32 md:w-44">
                  {post || 'Syncing Feed...'}
                </span>
              </div>
            </div>
          ))}
          {carouselPosts.length === 0 && [...Array(10)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-52 md:w-72 h-10 md:h-12 bg-[#1f1e1b] border border-[#252320] rounded-[8px] animate-pulse" />
          ))}
        </div>
      </div>

      {/* Top Right: Home */}
      <a href="https://www.krackeddevs.com" className="absolute top-20 md:top-24 right-6 md:right-12 z-[1100] group flex items-center gap-2 md:gap-3">
        <span className="kd-caps text-[9px] md:text-[10px] text-[#8e8b82] group-hover:text-[#141413] transition-colors">Home</span>
        <div className="w-4 md:w-8 h-[1px] bg-[#e6dfd8] group-hover:w-12 transition-all" style={{ backgroundColor: themeColor }} />
      </a>

      {/* Left Sidebar: Volume Selector */}
      <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 md:gap-6 z-[1100]">
        <div className="kd-caps text-[8px] md:text-[9px] text-[#8e8b82] vertical-text font-medium tracking-[0.3em] mb-4">Archives</div>
        {displayVolumes.map((v, i) => {
          const isAvailable = i === 0 || (v as any).status === 'published';
          const isActive = i === volIndex;
          return (
            <div
              key={i}
              className={`kd-display text-sm md:text-base transition-all duration-500 cursor-pointer relative group/vol ${isActive ? 'opacity-100' : 'opacity-35 hover:opacity-70'}`}
              onClick={() => { if (isAvailable) setVolIndex(i); }}
              style={{ color: isActive ? themeColor : '#141413' }}
            >
              {isActive && (
                <div className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full transition-all duration-500" style={{ backgroundColor: themeColor }} />
              )}
              {`VOL ${String(i + 1).padStart(2, '0')}`}
              {!isAvailable && (
                <span className="kd-caps absolute left-full ml-3 top-1/2 -translate-y-1/2 text-[7px] bg-[#efe9de] text-[#8e8b82] px-2 py-0.5 rounded-full opacity-0 group-hover/vol:opacity-100 whitespace-nowrap pointer-events-none">
                  Not published
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT SIDE: VOL PREVIEW COVER */}
      <div className="absolute right-[4%] md:right-[12%] top-1/2 -translate-y-1/2 hidden lg:block z-[1100] perspective-2000">
        <div
          className="relative w-80 h-[440px] bg-[#efe9de] border border-[#e6dfd8] shadow-[0_30px_60px_rgba(20,20,19,0.12)] rounded-[16px] preserve-3d transition-all duration-700 overflow-hidden"
          style={{ transform: 'rotateY(-14deg) rotateX(4deg)' }}
        >
          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: themeColor }} />
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
            <div>
              <span className="kd-caps text-[9px] text-[#8e8b82]">Core Archive</span>
              <h4 className="kd-display text-[40px] leading-[0.95] mt-3" style={{ color: themeColor }}>KRACKED<br/>DEVS</h4>
            </div>
            <div className="relative h-48 bg-[#181715] border border-[#252320] rounded-[8px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,var(--theme-color)_0%,transparent_70%)]" style={{ '--theme-color': themeColor } as any} />
              <span className="kd-display text-6xl text-[#faf9f5]/10 italic">{volIndex + 1}</span>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#252320] overflow-hidden">
                <div className="h-full animate-progress-dash" style={{ backgroundColor: themeColor }} />
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-[#e6dfd8] pt-5">
              <span className="kd-caps text-[8px] text-[#8e8b82]">Neural // Archive</span>
              <span className="kd-display text-4xl opacity-40" style={{ color: themeColor }}>{volIndex + 1}</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-center">
          <p className="kd-caps text-[8px] text-[#8e8b82]">Preview Node_{volIndex + 1}</p>
        </div>
      </div>

      {/* Bottom Left: Embed / Shortcode (dark code-window card) */}
      <div className="absolute bottom-6 md:bottom-12 left-4 md:left-12 z-[1100] space-y-3 max-w-[200px] md:max-w-xs">
        <div className="bg-[#181715] border border-[#252320] p-4 md:p-5 rounded-[12px] shadow-[0_12px_24px_rgba(20,20,19,0.15)]">
          <div className="kd-caps text-[8px] text-[#a09d96] mb-3 flex justify-between">
            <span>Embed</span>
            <span className="opacity-90" style={{ color: themeColor }}>ACTIVE</span>
          </div>
          <code className="text-[8px] md:text-[10px] text-[#faf9f5]/80 font-mono block leading-relaxed break-all bg-[#1f1e1b] p-2 md:p-3 rounded-[6px] border border-[#252320]">
            &lt;iframe src=".../embed/vol_{(volIndex + 1).toString().padStart(2, '0')}" /&gt;
          </code>
        </div>
        <div className="kd-caps text-[8px] text-[#8e8b82]">Shortcode: [VOL_VIEW_{volIndex + 1}]</div>
      </div>

      {/* Bottom Right: Badge & Visitor Count */}
      <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 z-[1100] flex flex-col items-end gap-2 md:gap-3">
        <div className="flex items-center gap-4 md:gap-6 bg-[#faf9f5] border border-[#e6dfd8] px-4 md:px-6 py-3 md:py-4 rounded-[12px] shadow-[0_8px_20px_rgba(20,20,19,0.06)]">
          <div className="flex flex-col items-end">
            <span className="kd-caps text-[7px] md:text-[8px] text-[#8e8b82]">Global Sync</span>
            <span className="text-sm md:text-xl font-semibold text-[#141413] tracking-tight">
              {visitorCount.toLocaleString()} <span className="text-[8px] md:text-xs kd-caps" style={{ color: themeColor }}>Visitors</span>
            </span>
          </div>
          <div className="w-px h-6 md:h-10 bg-[#e6dfd8]" />
          <a href={`https://x.com/${handle.replace('@', '')}`} target="_blank" className="flex items-center gap-3 group">
            <div className="flex flex-col items-end">
              <span className="kd-caps text-[6px] md:text-[7px] text-[#8e8b82] mb-1">Publisher · Week</span>
              <span className="kd-caps text-[7px] md:text-[8px]" style={{ color: themeColor }}>BADGE</span>
              <span className="text-[10px] md:text-sm font-medium text-[#141413] group-hover:opacity-70 transition-opacity italic">{handle}</span>
            </div>
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-lg transition-colors duration-500" style={{ backgroundColor: themeColor }}>W</div>
          </a>
        </div>
      </div>

      {/* Center: Enter */}
      <div className="relative z-[1200] flex flex-col items-center gap-8 scale-75 md:scale-100">
        <button onClick={() => onEnter(volIndex)} className="group relative flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-[-40px] rounded-full blur-[60px] opacity-15 transition-colors duration-1000 animate-pulse" style={{ backgroundColor: themeColor }} />
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center bg-[#faf9f5] border border-[#e6dfd8] shadow-[0_20px_50px_rgba(20,20,19,0.15)] group-hover:scale-110 group-hover:border-current transition-all duration-700 overflow-hidden" style={{ color: themeColor }}>
              <span className="kd-display text-4xl md:text-6xl font-semibold italic transition-colors duration-1000" style={{ color: themeColor }}>KD</span>
            </div>
          </div>
          <div className="mt-7 kd-caps text-[10px] md:text-xs tracking-[0.3em] kd-flicker" style={{ color: themeColor }}>
            Enter Archive
          </div>
        </button>
      </div>

      <style>{`
        @keyframes scroll-x { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll-x { animation: scroll-x 40s linear infinite; width: max-content; }
        .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); }
        @keyframes progress-dash { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress-dash { animation: progress-dash 4s linear infinite; }
      `}</style>
    </div>
  );
};

export default Intro;

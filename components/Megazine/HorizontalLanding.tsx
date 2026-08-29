
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Volume, resolveTheme } from '../../types';

interface HorizontalLandingProps {
  onEnter: (volIndex: number) => void;
  availableVolumes: Volume[];
}

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'archives', label: 'Archives' },
  { id: 'faq', label: 'FAQ' },
  { id: 'blog', label: 'Blog' },
  { id: 'about', label: 'About' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'connect', label: 'Connect' },
] as const;

const FAQ_ITEMS = [
  {
    q: 'What is Kracked Devs?',
    a: 'KrackedDevs (KD) is a self-sustaining builder ecosystem connecting builders across Malaysia through community, gamification, and real projects — from your first commit to shipping in production. It comprises three pillars: KD Community (guilds, events, hackathons), KD Labs (community-built tools and products), and KD Academy (structured learning paths and bootcamps).',
  },
  {
    q: 'What is the Megazine?',
    a: 'The Megazine is an interactive, spatial publication engine built by the KD community. Each monthly volume covers Malaysia\'s AI ecosystem, developer community bounties, policy updates, and global tech developments. It supports hand-tracking page flips, per-volume themes, and community-contributed content.',
  },
  {
    q: 'How do I join the community?',
    a: 'Sign up at krackeddevs.com to join guilds, attend events, take bounties, and participate in hackathons. The community is active across Discord, X (Twitter), Threads, and the KD Square forum on the website.',
  },
  {
    q: 'What are Guilds and how do they work?',
    a: 'Guilds are topic-based builder groups within KD — like Pingu-Tech Devs or PeakyBuildr. Each guild has its own focus, members, and projects. You join a guild to collaborate with others on shared builds or learn specific skills.',
  },
  {
    q: 'How do Bounties work?',
    a: 'Companies or the community post paid briefs with a budget in MYR. Vetted community builders pick them up, deliver the work, and get paid directly. KD brokers the transaction. Bounties range from small features to full MVPs.',
  },
  {
    q: 'What is KD Academy?',
    a: 'KD Academy (academy.krackeddevs.com) offers structured learning paths, bootcamps, and workshops led by people shipping in production. It focuses on practical AI training — build with AI, prove it in the field.',
  },
  {
    q: 'What is KD Labs?',
    a: 'KD Labs (kdlabs.krackeddevs.com) is where the community ships real tools. Products include jomqr.my (QR digital cards), kuntum.app (AI-native hiring), mypeta.ai (Malaysia tech map), wiki.krackeddevs.com (ecosystem index), fluid.krackeddevs.com (generative backgrounds), and pasarapi.xyz (verified SE Asian APIs).',
  },
  {
    q: 'Can I hire builders from KD?',
    a: 'Yes. Two paths: post a bounty for one-off builds (MVPs, features, integrations), or use Kuntum & Embun — KD\'s AI-native job platform for full-time hiring. Embun drafts transparent job posts via chat and surfaces anonymized candidate interest. It\'s free during beta.',
  },
  {
    q: 'How do I access the Megazine CMS?',
    a: 'Navigate to /#/krackedmin-admin to access the Page Builder. It allows editing volume content, creating new pages, and managing the editorial pipeline.',
  },
];

const BLOG_POSTS = [
  {
    title: 'The Slang-Aware Model: A Technical Teardown',
    date: 'Apr 2026',
    excerpt: 'We benchmarked Malaysia\'s open-weight Slang-Aware base model against three frontier models on Manglish ASR, code-switching, and legal reasoning.',
    tag: 'Deep Dive',
    color: '#39ff14',
  },
  {
    title: 'KedaiVision: From RM150 Prototype to 30-Shop Pilot',
    date: 'Mar 2026',
    excerpt: 'How a countertop vision kit for warungs went from a Raspberry Pi to a federated retail intelligence network.',
    tag: 'Case Study',
    color: '#e8a55a',
  },
  {
    title: 'Agent Budgets: The New Architecture Discipline',
    date: 'May 2026',
    excerpt: 'Why treating agents as a budget — not a magic — is the difference between a demo and a production system.',
    tag: 'Opinion',
    color: '#5db8a6',
  },
  {
    title: 'The Virtual Power Plant Goes Federal',
    date: 'Apr 2026',
    excerpt: 'Three regional battery fleets now arbitrage across the peninsula under a single AI dispatch layer.',
    tag: 'Infrastructure',
    color: '#a9583e',
  },
  {
    title: 'BanjirNet: One Sensor, Sixty Nodes',
    date: 'Jun 2026',
    excerpt: 'How a community flood-sensing mesh started with one volunteer\'s drain and became the east coast\'s warning system.',
    tag: 'Community',
    color: '#8a7bd8',
  },
  {
    title: 'Ownership Is the Only Moat',
    date: 'Jul 2026',
    excerpt: 'A country that runs its own data lake, eval harness, and base model is not renting its future.',
    tag: 'Editorial',
    color: '#cc785c',
  },
];

const ROADMAP_ITEMS = [
  { quarter: 'Q1', year: '2026', title: 'The Neural Inaugural', status: 'done', items: ['7 volumes published', 'Slang-Aware base model', 'Community bounties', '500+ production deployments'] },
  { quarter: 'Q2', year: '2026', title: 'The Build Season', status: 'done', items: ['KDEVCON 2026', 'Virtual power plant', 'Edge model registry (175+)', '70K AI Supervisors certified'] },
  { quarter: 'Q3', year: '2026', title: 'The Community Volume', status: 'active', items: ['Community submissions open', 'Voice-to-voice editorial', 'August submission window', 'Quarterly compilation loop'] },
  { quarter: 'Q4', year: '2026', title: 'The Spatial Editor', status: 'upcoming', items: ['VR-first spatial editor', 'Memory nodes v2', 'Regional export program', '1M AI-trained Malaysians'] },
];

const HorizontalLanding: React.FC<HorizontalLandingProps> = ({ onEnter, availableVolumes }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visitorCount, setVisitorCount] = useState(15);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const theme = resolveTheme(availableVolumes[0], 0);
  const themeColor = theme.accent;

  // Visitor counter
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
      } catch {
        setVisitorCount(prev => prev + 1);
      }
    };
    fetchVisitorCount();
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: container, threshold: 0.4 }
    );
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(`section-${item.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, []);

  // Horizontal wheel → horizontal scroll, unless the section can scroll vertically
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    const isVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    // If the wheel is over a vertically-scrollable section, let it scroll natively
    const section = (e.target as HTMLElement).closest?.('section');
    if (isVertical && section && section.scrollHeight > section.clientHeight + 1) {
      return;
    }
    if (isVertical) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  }, []);

  const displayVolumes = Array(Math.max(5, availableVolumes.length)).fill(null).map((_, i) => {
    const vol = availableVolumes.find(v => v.volume === i + 1);
    return vol || { volume: i + 1, status: 'draft', title: 'Pending' };
  });

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#faf9f5' }}>

      {/* Noise grain overlay */}
      <div className="kd-noise-overlay" />

      {/* Bottom nav bar — floating glass pill */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1200] flex items-center justify-center pb-5 md:pb-6 pointer-events-none">
        <div className="kd-nav-pill pointer-events-auto max-w-[calc(100vw-24px)]">
          <div className="flex items-center gap-1 pl-2 pr-0 w-full min-w-0">
            {/* Logo */}
            <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#141413]/5 transition-colors flex-shrink-0">
              <div className="w-7 h-7 rounded-[6px] overflow-hidden flex-shrink-0 bg-[#050505] flex items-center justify-center">
                <svg viewBox="0 0 80 40" preserveAspectRatio="xMidYMid meet" className="w-full h-full"><g fill="#00CC00"><rect x="10" y="8" width="4" height="24" /><rect x="14" y="16" width="4" height="4" opacity="0.6" /><rect x="18" y="12" width="4" height="4" opacity="0.736" /><rect x="22" y="8" width="4" height="4" opacity="0.936" /><rect x="14" y="20" width="4" height="4" opacity="0.6" /><rect x="18" y="24" width="4" height="4" /><rect x="22" y="28" width="4" height="4" opacity="0.6" /><rect x="40" y="8" width="4" height="24" opacity="0.6" /><rect x="44" y="8" width="8" height="4" opacity="0.6" /><rect x="44" y="28" width="8" height="4" opacity="0.6" /><rect x="52" y="12" width="4" height="16" opacity="0.6" /></g></svg>
              </div>
              <span className="hidden md:inline kd-caps text-[9px] tracking-[0.2em] text-[#6c6a64]">Kracked Devs</span>
            </button>
            {/* Divider */}
            <div className="w-px h-5 bg-[#e6dfd8] flex-shrink-0" />
            {/* Nav links — horizontally scrollable on mobile so nothing is clipped */}
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-r-full flex-1 min-w-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`px-3 py-2 rounded-full text-[11px] font-medium tracking-wide transition-all duration-300 flex-shrink-0 ${
                    activeSection === item.id
                      ? 'text-[#faf9f5]'
                      : 'text-[#6c6a64] hover:text-[#141413] hover:bg-[#141413]/[0.04]'
                  }`}
                  style={activeSection === item.id ? { background: themeColor } : {}}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.horizontal-scroll::-webkit-scrollbar { display: none; }`}</style>

        {/* ─── HERO ─── */}
        <section
          id="section-hero"
          className="snap-start flex-shrink-0 w-screen h-full overflow-y-auto relative"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            setMousePos({ x, y });
          }}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        >
          <div className="kd-theme-bg" />

          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="hero-dots" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="0.8" fill={themeColor} />
              </pattern>
              <rect width="100%" height="100%" fill="url(#hero-dots)" />
            </svg>
          </div>

          <div className="relative z-10 min-h-full w-full flex flex-col items-center justify-center gap-8 px-6 py-24 text-center">
            {/* Eyebrow */}
            <div className="kd-caps text-[10px] md:text-[11px] tracking-[0.4em] text-[#8e8b82]">
              Neural Editorial Archive — Vol 01–07
            </div>

            {/* Central logo */}
            <div className="relative group cursor-pointer" onClick={() => onEnter(0)}>
              <div className="absolute inset-[-60px] rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-20" style={{ background: `radial-gradient(circle, ${themeColor}, transparent)` }} />
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center bg-[#050505] border border-[#252320] shadow-[0_30px_80px_rgba(20,20,19,0.12)] group-hover:scale-105 group-hover:shadow-[0_40px_100px_rgba(20,20,19,0.18)] transition-all duration-700 overflow-hidden p-8">
                <svg
                  viewBox="0 0 80 40"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full"
                  style={{
                    transform: `translate(${mousePos.x * 18}px, ${mousePos.y * 18}px)`,
                    transition: 'transform 0.15s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  <g fill="#00CC00">
                    <rect x="10" y="8" width="4" height="24" />
                    <rect x="14" y="16" width="4" height="4" opacity="0.6" />
                    <rect x="18" y="12" width="4" height="4" opacity="0.736" />
                    <rect x="22" y="8" width="4" height="4" opacity="0.936" />
                    <rect x="14" y="20" width="4" height="4" opacity="0.6" />
                    <rect x="18" y="24" width="4" height="4" />
                    <rect x="22" y="28" width="4" height="4" opacity="0.6" />
                    <rect x="40" y="8" width="4" height="24" opacity="0.6" />
                    <rect x="44" y="8" width="8" height="4" opacity="0.6" />
                    <rect x="44" y="28" width="8" height="4" opacity="0.6" />
                    <rect x="52" y="12" width="4" height="16" opacity="0.6" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="kd-display text-4xl md:text-6xl lg:text-7xl text-[#141413] leading-[0.95]">
                Kracked Devs
              </h1>
              <p className="mt-4 text-sm md:text-base text-[#6c6a64] max-w-md leading-relaxed">
                Monthly volumes covering Malaysia's AI ecosystem, developer community, and the spatial computing frontier.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => onEnter(0)}
              className="group flex items-center gap-3 px-8 py-4 rounded-full text-[#faf9f5] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(20,20,19,0.2)]"
              style={{ background: themeColor }}
            >
              <span className="kd-caps text-[11px] tracking-[0.25em]">Enter Archive</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Scroll hint */}
            <div className="flex items-center gap-2 mt-4 opacity-40">
              <div className="w-8 h-[1px] bg-[#8e8b82]" />
              <span className="kd-caps text-[8px] tracking-[0.3em] text-[#8e8b82]">Scroll to explore</span>
              <div className="w-8 h-[1px] bg-[#8e8b82]" />
            </div>
          </div>
        </section>

        {/* ─── ARCHIVES ─── */}
        <section id="section-archives" className="snap-start flex-shrink-0 w-screen h-full overflow-y-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f5] via-[#f5f0e8] to-[#efe9de]" />

          <div className="relative z-10 min-h-full w-full flex flex-col lg:flex-row lg:items-center lg:gap-16 px-8 pt-12 pb-28 md:px-16 lg:px-24 lg:pb-12">
            {/* Section header */}
            <div className="mb-10 md:mb-14 lg:mb-0">
              <span className="kd-caps text-[9px] tracking-[0.4em] text-[#8e8b82]">Volume Archive</span>
              <h2 className="kd-display text-3xl md:text-5xl text-[#141413] mt-3 leading-[0.95]">
                Seven Monthly<br />Editions
              </h2>
              <p className="mt-4 text-sm text-[#6c6a64] max-w-sm">
                Each volume is a self-contained protocol — curated, designed, and compiled from the network's own nodes.
              </p>
            </div>

            {/* Volume cards — horizontal row */}
            <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {displayVolumes.map((v, i) => {
                const isPublished = i === 0 || (v as any).status === 'published';
                const volTheme = resolveTheme(v, i);
                return (
                  <button
                    key={i}
                    onClick={() => isPublished && onEnter(i)}
                    disabled={!isPublished}
                    className={`kd-volume-card flex-shrink-0 w-44 md:w-52 text-left group ${isPublished ? 'cursor-pointer' : 'opacity-40 cursor-default'}`}
                  >
                    <div className="relative h-60 md:h-72 rounded-2xl overflow-hidden border transition-all duration-500"
                         style={{
                           background: isPublished ? '#181715' : '#f5f0e8',
                           borderColor: isPublished ? `${volTheme.accent}33` : '#e6dfd8',
                         }}>
                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: volTheme.accent }} />

                      {/* Volume number */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="kd-display text-7xl md:text-8xl italic transition-opacity"
                              style={{ color: isPublished ? `${volTheme.accent}15` : '#e6dfd840' }}>
                          {i + 1}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 w-full p-5">
                        <div className="kd-caps text-[8px] tracking-[0.3em] mb-2"
                             style={{ color: isPublished ? volTheme.accent : '#8e8b82' }}>
                          {isPublished ? 'Published' : 'Draft'}
                        </div>
                        <h3 className="kd-display text-lg text-[#faf9f5] leading-tight">
                          VOL {String(i + 1).padStart(2, '0')}
                        </h3>
                        <p className="text-[10px] text-[#a09d96] mt-1 line-clamp-2">
                          {(v as any).title || `Edition ${i + 1}`}
                        </p>
                      </div>

                      {/* Hover glow */}
                      {isPublished && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                             style={{ background: `radial-gradient(circle at 50% 50%, ${volTheme.accent}12, transparent 70%)` }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="section-faq" className="snap-start flex-shrink-0 w-screen h-full overflow-y-auto relative">
          <div className="absolute inset-0 bg-[#faf9f5]" />

          <div className="relative z-10 min-h-full w-full flex flex-col lg:flex-row lg:items-center lg:gap-16 px-8 pt-12 pb-28 md:px-16 lg:px-24 lg:pb-12 max-w-4xl mx-auto">
            <div className="mb-10 md:mb-14 lg:mb-0">
              <span className="kd-caps text-[9px] tracking-[0.4em] text-[#8e8b82]">Questions & Answers</span>
              <h2 className="kd-display text-3xl md:text-5xl text-[#141413] mt-3 leading-[0.95]">
                Frequently Asked
              </h2>
            </div>

            <div className="space-y-0">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border-b border-[#e6dfd8]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 md:py-6 text-left group"
                  >
                    <span className="kd-display text-lg md:text-xl text-[#141413] group-hover:opacity-70 transition-opacity pr-6">
                      {item.q}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-[#e6dfd8] flex items-center justify-center flex-shrink-0 transition-all duration-300"
                         style={openFaq === i ? { background: themeColor, borderColor: themeColor } : {}}>
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openFaq === i ? 'rotate-45 text-white' : 'text-[#6c6a64]'}`}
                           fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                      </svg>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    openFaq === i ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-sm md:text-base text-[#6c6a64] leading-relaxed max-w-2xl">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BLOG ─── */}
        <section id="section-blog" className="snap-start flex-shrink-0 w-screen h-full overflow-y-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f5] via-[#f5f0e8] to-[#efe9de]" />

          <div className="relative z-10 min-h-full w-full flex flex-col lg:flex-row lg:items-center lg:gap-16 px-8 pt-12 pb-28 md:px-16 lg:px-24 lg:pb-12">
            <div className="mb-10 md:mb-14 lg:mb-0">
              <span className="kd-caps text-[9px] tracking-[0.4em] text-[#8e8b82]">From the Network</span>
              <h2 className="kd-display text-3xl md:text-5xl text-[#141413] mt-3 leading-[0.95]">
                Latest Dispatches
              </h2>
              <p className="mt-4 text-sm text-[#6c6a64] max-w-sm">
                Deep dives, case studies, and editorials from the Kracked Devs community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {BLOG_POSTS.map((post, i) => (
                <div key={i} className="kd-blog-card group cursor-pointer">
                  <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl p-6 h-full flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(20,20,19,0.08)] hover:border-[#d5cec4]">
                    {/* Tag */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 rounded-full" style={{ background: post.color }} />
                      <span className="kd-caps text-[9px] tracking-[0.2em]" style={{ color: post.color }}>
                        {post.tag}
                      </span>
                      <span className="text-[10px] text-[#a09d96] ml-auto">{post.date}</span>
                    </div>
                    {/* Title */}
                    <h3 className="kd-display text-lg md:text-xl text-[#141413] leading-snug mb-3 group-hover:opacity-70 transition-opacity">
                      {post.title}
                    </h3>
                    {/* Excerpt */}
                    <p className="text-[13px] text-[#6c6a64] leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                    {/* Read more */}
                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#e6dfd8]">
                      <span className="kd-caps text-[9px] tracking-[0.2em] text-[#8e8b82] group-hover:text-[#141413] transition-colors">Read</span>
                      <div className="w-4 h-[1px] bg-[#e6dfd8] group-hover:w-8 transition-all" style={{ backgroundColor: post.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ABOUT ─── */}
        <section id="section-about" className="snap-start flex-shrink-0 w-screen h-full overflow-y-auto relative">
          <div className="absolute inset-0 bg-[#181715]" />

          <div className="relative z-10 min-h-full w-full flex items-center px-8 pt-12 pb-28 md:px-16 lg:px-24 lg:pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
              {/* Left: Text */}
              <div>
                <span className="kd-caps text-[9px] tracking-[0.4em] text-[#a09d96]">About the Project</span>
                <h2 className="kd-display text-3xl md:text-5xl text-[#faf9f5] mt-3 leading-[0.95]">
                  A Network That<br />Writes Itself
                </h2>
                <p className="mt-6 text-sm md:text-base text-[#a09d96] leading-relaxed max-w-lg">
                  Kracked Devs began as a monthly editorial covering Malaysia's AI ecosystem. It evolved into something larger — a neural editorial network where the community submits, votes, and the pipeline compiles each volume.
                </p>
                <p className="mt-4 text-sm md:text-base text-[#a09d96] leading-relaxed max-w-lg">
                  Seven volumes in, the thesis is proven: a magazine produced by its own network, for its own network. Every node on every page is a person who showed up.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-10">
                  {[
                    { value: '7', label: 'Volumes' },
                    { value: '1,800+', label: 'Contributors' },
                    { value: '12K+', label: 'Votes Cast' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="kd-display text-2xl md:text-3xl" style={{ color: themeColor }}>{stat.value}</div>
                      <div className="kd-caps text-[8px] tracking-[0.2em] text-[#a09d96] mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Visual */}
              <div className="hidden md:flex justify-center">
                <div className="relative">
                  {/* Stacked cards */}
                  <div className="absolute -top-4 -left-4 w-72 h-96 rounded-2xl border border-[#252320] bg-[#1f1e1b] transform -rotate-3" />
                  <div className="absolute -top-2 left-2 w-72 h-96 rounded-2xl border border-[#252320] bg-[#1f1e1b] transform rotate-1" />
                  <div className="relative w-72 h-96 rounded-2xl border border-[#252320] bg-[#1f1e1b] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${themeColor}, #39ff14, #e8a55a, #5db8a6, #a9583e)` }} />
                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                      <div>
                        <span className="kd-caps text-[8px] text-[#a09d96]">Neural Editorial</span>
                        <div className="mt-3 w-20 h-20 rounded-[10px] overflow-hidden bg-[#050505] flex items-center justify-center">
                          <svg viewBox="0 0 80 40" preserveAspectRatio="xMidYMid meet" className="w-full h-full"><g fill="#00CC00"><rect x="10" y="8" width="4" height="24" /><rect x="14" y="16" width="4" height="4" opacity="0.6" /><rect x="18" y="12" width="4" height="4" opacity="0.736" /><rect x="22" y="8" width="4" height="4" opacity="0.936" /><rect x="14" y="20" width="4" height="4" opacity="0.6" /><rect x="18" y="24" width="4" height="4" /><rect x="22" y="28" width="4" height="4" opacity="0.6" /><rect x="40" y="8" width="4" height="24" opacity="0.6" /><rect x="44" y="8" width="8" height="4" opacity="0.6" /><rect x="44" y="28" width="8" height="4" opacity="0.6" /><rect x="52" y="12" width="4" height="16" opacity="0.6" /></g></svg>
                        </div>
                        <h3 className="kd-display text-3xl text-[#faf9f5] mt-4 leading-[0.95]">KRACKED<br />DEVS</h3>
                      </div>
                      <div className="space-y-3">
                        {['Vol 01 — Neural Inaugural', 'Vol 02 — The Neural Spring', 'Vol 03 — The Build Month'].map((t, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: themeColor }} />
                            <span className="text-[10px] text-[#a09d96]">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ROADMAP ─── */}
        <section id="section-roadmap" className="snap-start flex-shrink-0 w-screen h-full overflow-y-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f5] via-[#f5f0e8] to-[#efe9de]" />

          <div className="relative z-10 min-h-full w-full flex flex-col lg:flex-row lg:items-center lg:gap-16 px-8 pt-12 pb-28 md:px-16 lg:px-24 lg:pb-12">
            <div className="mb-10 md:mb-14 lg:mb-0">
              <span className="kd-caps text-[9px] tracking-[0.4em] text-[#8e8b82]">2026 Vision</span>
              <h2 className="kd-display text-3xl md:text-5xl text-[#141413] mt-3 leading-[0.95]">
                The Roadmap
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {ROADMAP_ITEMS.map((item, i) => (
                <div key={i} className="relative">
                  {/* Connector line */}
                  {i < ROADMAP_ITEMS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-[1px] bg-[#e6dfd8] z-0" />
                  )}

                  <div className={`relative z-10 rounded-2xl p-6 border transition-all duration-500 ${
                    item.status === 'done'
                      ? 'bg-[#181715] border-[#252320]'
                      : item.status === 'active'
                      ? 'bg-[#faf9f5] border-2'
                      : 'bg-[#faf9f5] border-[#e6dfd8]'
                  }`}
                  style={item.status === 'active' ? { borderColor: themeColor } : {}}>
                    {/* Status dot */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'done' ? 'bg-[#5db872]' :
                        item.status === 'active' ? 'bg-current animate-pulse' : 'bg-[#e6dfd8]'
                      }`} style={item.status === 'active' ? { color: themeColor } : {}} />
                      <span className={`kd-caps text-[9px] tracking-[0.2em] ${
                        item.status === 'done' ? 'text-[#5db872]' :
                        item.status === 'active' ? '' : 'text-[#a09d96]'
                      }`} style={item.status === 'active' ? { color: themeColor } : {}}>
                        {item.status === 'done' ? 'Complete' : item.status === 'active' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>

                    {/* Quarter */}
                    <div className="kd-display text-3xl" style={{ color: item.status === 'active' ? themeColor : '#141413' }}>
                      {item.quarter}
                    </div>
                    <div className="text-[10px] text-[#a09d96] mb-2">{item.year}</div>

                    {/* Title */}
                    <h3 className={`kd-display text-lg mb-4 ${
                      item.status === 'done' ? 'text-[#faf9f5]' : 'text-[#141413]'
                    }`}>
                      {item.title}
                    </h3>

                    {/* Items */}
                    <ul className="space-y-2">
                      {item.items.map((text, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                               style={{ background: item.status === 'done' ? '#5db872' : item.status === 'active' ? themeColor : '#d5cec4' }} />
                          <span className={`text-[11px] leading-relaxed ${
                            item.status === 'done' ? 'text-[#a09d96]' : 'text-[#6c6a64]'
                          }`}>
                            {text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CONNECT ─── */}
        <section id="section-connect" className="snap-start flex-shrink-0 w-screen h-full overflow-y-auto relative">
          <div className="absolute inset-0 bg-[#181715]" />

          <div className="relative z-10 min-h-full w-full flex flex-col items-center px-8 pt-12 pb-28 md:px-16 lg:px-24 lg:pb-12 max-w-3xl mx-auto text-center">
            <span className="kd-caps text-[9px] tracking-[0.4em] text-[#a09d96]">Join the Network</span>
            <h2 className="kd-display text-3xl md:text-5xl text-[#faf9f5] mt-3 leading-[0.95]">
              Stay Connected
            </h2>
            <p className="mt-6 text-sm text-[#a09d96] leading-relaxed max-w-lg mx-auto">
              Early volume access, bounty drops, community-volume submission alerts, and build-in-public threads — all in one place.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              {[
                { label: 'X / Twitter', href: 'https://x.com/KrackedDevs', icon: 'X' },
                { label: 'GitHub', href: 'https://github.com/kracked-devs', icon: 'GH' },
                { label: 'Website', href: 'https://www.krackeddevs.com', icon: 'WEB' },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 rounded-full border border-[#252320] bg-[#1f1e1b] hover:border-current transition-all duration-300"
                  style={{ ['--hover-color' as any]: themeColor }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#faf9f5]/60 group-hover:text-[#faf9f5] transition-colors"
                       style={{ background: `${themeColor}20` }}>
                    {link.icon}
                  </div>
                  <span className="text-sm text-[#a09d96] group-hover:text-[#faf9f5] transition-colors">{link.label}</span>
                </a>
              ))}
            </div>

            {/* Visitor count */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#5db872] animate-pulse" />
              <span className="text-xs text-[#a09d96]">
                <span className="text-[#faf9f5] font-medium">{visitorCount.toLocaleString()}</span> global visitors synced
              </span>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-[#252320]">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-[5px] overflow-hidden bg-[#050505] flex items-center justify-center">
                  <svg viewBox="0 0 80 40" preserveAspectRatio="xMidYMid meet" className="w-full h-full"><g fill="#00CC00"><rect x="10" y="8" width="4" height="24" /><rect x="14" y="16" width="4" height="4" opacity="0.6" /><rect x="18" y="12" width="4" height="4" opacity="0.736" /><rect x="22" y="8" width="4" height="4" opacity="0.936" /><rect x="14" y="20" width="4" height="4" opacity="0.6" /><rect x="18" y="24" width="4" height="4" /><rect x="22" y="28" width="4" height="4" opacity="0.6" /><rect x="40" y="8" width="4" height="24" opacity="0.6" /><rect x="44" y="8" width="8" height="4" opacity="0.6" /><rect x="44" y="28" width="8" height="4" opacity="0.6" /><rect x="52" y="12" width="4" height="16" opacity="0.6" /></g></svg>
                </div>
                <span className="kd-caps text-[9px] tracking-[0.3em] text-[#a09d96]">Kracked Devs</span>
              </div>
              <p className="text-[10px] text-[#6c6a64]">
                Architect: @RikayuWilzam · Platform: Penzine Engine v2.0
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Right: section indicator dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[1200] flex flex-col items-center gap-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="group relative"
            aria-label={item.label}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-400 ${
              activeSection === item.id ? 'h-6' : 'hover:opacity-60'
            }`}
            style={{ background: activeSection === item.id ? themeColor : '#d5cec4' }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HorizontalLanding;

import React, { useState, useEffect } from 'react';
import { Volume, VOLUME_COLORS } from '../../types';
import { useNavigate } from 'react-router';

const EMPTY_VOLUME_TEMPLATE = (volNum: number): Volume => ({
  id: `vol-${volNum}`,
  volume: volNum,
  title: `Volume ${volNum} (Draft)`,
  date: 'Pending',
  status: 'draft',
  themeColor: VOLUME_COLORS[volNum - 1] || '#cc785c',
  layout: { autoFit: true, columns: 2, newspaperMode: true },
  pages: Array(11).fill('# New Page\n\nContent goes here...')
});

const PageBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [selectedVolIdx, setSelectedVolIdx] = useState(0);
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render on JSON upload

  // Load from localStorage or toggle defaults
  useEffect(() => {
    const saved = localStorage.getItem('kd_volumes');
    let loadedVols: Volume[] = saved ? JSON.parse(saved) : [];

    // Ensure we have Vol 1-5 placeholders
    const completeVols = [...loadedVols];
    for (let i = 1; i <= 5; i++) {
        if (!completeVols.find(v => v.volume === i)) {
            completeVols.push(EMPTY_VOLUME_TEMPLATE(i));
        }
    }
    // Sort by volume number
    completeVols.sort((a, b) => a.volume - b.volume);

    setVolumes(completeVols);
  }, []);

  const activeVol = volumes[selectedVolIdx];

  const handleContentChange = (val: string) => {
    if (!activeVol) return;
    const newVols = [...volumes];
    const vol = newVols[selectedVolIdx];
    const newPages = [...vol.pages];
    newPages[selectedPageIdx] = val;
    vol.pages = newPages;
    setVolumes(newVols);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Schema check (basic)
        if (!json.pages || !Array.isArray(json.pages)) {
            alert("Invalid JSON format. Must contain 'pages' array.");
            return;
        }

        const newVols = [...volumes];
        // Merge uploaded data into current volume
        newVols[selectedVolIdx] = {
            ...newVols[selectedVolIdx],
            ...json,
            volume: newVols[selectedVolIdx].volume, // Enforce ID persistence
            id: newVols[selectedVolIdx].id
        };
        setVolumes(newVols);
        setRefreshKey(prev => prev + 1);
        alert(`Successfully loaded content for Volume ${activeVol.volume}`);
      } catch (err) {
        alert("Error parsing JSON file");
      }
    };
    reader.readAsText(file);
  };

  const saveChanges = () => {
    localStorage.setItem('kd_volumes', JSON.stringify(volumes));
    alert('All Volumes Saved to Local Storage! Returns to Main Menu to see changes.');
  };

  const publishVolume = () => {
    const newVols = [...volumes];
    // Toggle status
    newVols[selectedVolIdx].status = newVols[selectedVolIdx].status === 'published' ? 'draft' : 'published';
    setVolumes(newVols);
  };

  if (!activeVol) return <div className="p-10 text-[#c8c0b2]">Loading Node Builder...</div>;

  const themeColor = activeVol.themeColor || '#cc785c';

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#3d3d3a] font-sans flex flex-col md:flex-row">

      {/* Sidebar: Volume Selector */}
      <div className="w-full md:w-64 border-r border-[#e6dfd8] bg-[#f5f1ea] flex flex-col">
        <div className="p-4 border-b border-[#e6dfd8]">
           <h1 className="kd-display text-xl italic tracking-tight" style={{ color: themeColor }}>KRACKED<br/>BUILDER_v1</h1>
           <button onClick={() => navigate('/')} className="mt-4 kd-caps text-[10px] tracking-widest text-[#8e8b82] hover:text-[#141413]">&larr; Back to App</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="kd-caps text-[10px] tracking-widest text-[#8e8b82] mb-2">Select Neural Node</div>
            {volumes.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => { setSelectedVolIdx(i); setSelectedPageIdx(0); }}
                  className={`w-full text-left p-3 rounded-[8px] border transition-all relative overflow-hidden group ${selectedVolIdx === i ? 'text-[#141413] bg-white shadow-sm' : 'border-[#e6dfd8] hover:border-[#c8c0b2] text-[#6c6a64]'}`}
                  style={selectedVolIdx === i ? { borderColor: themeColor } : undefined}
                >
                    <div className="kd-caps text-xs font-semibold uppercase" style={{ color: themeColor }}>VOL {v.volume.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] truncate italic">{v.title}</div>
                    <div className={`text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded-full kd-caps ${v.status === 'published' ? 'bg-[#cc785c]/15 text-[#cc785c]' : 'bg-[#e6dfd8] text-[#8e8b82]'}`}>
                        {v.status === 'published' ? 'LIVE' : 'NOT PUBLISHED'}
                    </div>
                    {/* Active Indicator */}
                    {selectedVolIdx === i && <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: themeColor }} />}
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-[#e6dfd8]">
            <button key={refreshKey} onClick={publishVolume} className={`w-full py-3 mb-2 kd-caps text-xs tracking-widest border border-dashed rounded-[8px] hover:opacity-80 transition-all ${activeVol.status === 'published' ? 'border-[#cc785c] text-[#cc785c]' : 'border-[#141413] text-[#141413]'}`}>
                {activeVol.status === 'published' ? 'UNPUBLISH NODE' : 'PUBLISH NODE'}
            </button>
            <button onClick={saveChanges} className="w-full py-3 kd-caps text-xs tracking-widest rounded-[8px] text-[#faf9f5] hover:opacity-90" style={{ backgroundColor: themeColor }}>
                SAVE &amp; SYNC
            </button>
        </div>
      </div>

      {/* Main Content: Page Editor */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header Toolbar */}
        <div className="h-16 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                {activeVol.pages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPageIdx(i)}
                      className={`h-8 w-8 md:w-auto md:px-3 kd-caps text-[10px] border rounded-full flex items-center justify-center transition-all ${selectedPageIdx === i ? 'text-white border-white' : 'border-[#e6dfd8] text-[#8e8b82] hover:border-[#c8c0b2]'}`}
                      style={selectedPageIdx === i ? { backgroundColor: themeColor } : undefined}
                    >
                        {i === 0 ? 'CVR' : i.toString().padStart(2, '0')}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 ml-4">
               <label className="cursor-pointer group flex items-center gap-2">
                  <div className="kd-caps text-[9px] text-[#8e8b82] group-hover:text-[#141413] tracking-wider text-right">
                    Import JSON<br/>Structure
                  </div>
                  <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
                  <div className="w-8 h-8 rounded-full border border-[#e6dfd8] flex items-center justify-center group-hover:border-[#cc785c] text-[#8e8b82] group-hover:text-[#cc785c]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
               </label>
            </div>
        </div>

        {/* Editor & Preview Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Editor Input */}
            <div className="flex-1 border-r border-[#e6dfd8] p-6 flex flex-col bg-[#f5f1ea]">
                <div className="mb-4 flex justify-between items-end">
                    <span className="kd-caps text-xs text-[#8e8b82]">MARKDOWN SOURCE // PAGE_{selectedPageIdx}</span>
                </div>
                <textarea
                    value={activeVol.pages[selectedPageIdx] || ''}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="flex-1 w-full bg-[#faf9f5] border border-[#e6dfd8] p-4 font-mono text-sm text-[#3d3d3a] resize-none focus:outline-none rounded-[8px] leading-relaxed"
                    style={{ boxShadow: `0 0 0 3px transparent` }}
                    spellCheck={false}
                />
                <div className="mt-2 kd-caps text-[10px] text-[#8e8b82]">
                    Supports: # Headers, **Bold**, *Italic*, ![Image](url), [Link](url), [BADGE: text]
                </div>
            </div>

            {/* Live Preview (Simulated Rendering) */}
            <div className="flex-1 bg-[#faf9f5] p-6 overflow-y-auto relative">
                 <div className="absolute top-6 right-6 kd-caps text-[10px] tracking-[1em] text-[#c8c0b2] select-none">PREVIEW</div>
                 <div className="max-w-md mx-auto min-h-[600px] border border-[#e6dfd8] bg-[#faf9f5] p-8 shadow-[0_12px_40px_rgba(20,20,19,0.08)] rounded-[8px] relative group">
                    {/* Simulated Text Rendering based on basic markdown */}
                    <div className="prose prose-sm max-w-none">
                        {(activeVol.pages[selectedPageIdx] || '').split('\n').map((line, i) => {
                            if (line.startsWith('# ')) return <h1 key={i} className="kd-display text-2xl italic uppercase mb-4" style={{ color: activeVol.themeColor }}>{line.replace('# ', '')}</h1>
                            if (line.startsWith('## ')) return <h2 key={i} className="kd-caps text-lg font-semibold uppercase mb-3 border-b-2 pb-1 mt-6" style={{ borderColor: activeVol.themeColor }}>{line.replace('## ', '')}</h2>
                            if (line.startsWith('### ')) return <h3 key={i} className="kd-caps text-sm font-semibold uppercase mb-2 mt-4 text-[#6c6a64]">{line.replace('### ', '')}</h3>
                            if (line.startsWith('![')) {
                                const url = line.match(/\((.*?)\)/)?.[1];
                                const alt = line.match(/\[(.*?)\]/)?.[1];
                                return <img key={i} src={url} alt={alt} className="w-full h-48 object-cover my-4 border border-[#e6dfd8] rounded-[8px]" />
                            }
                            if (line.startsWith('[BADGE:')) {
                                const text = line.match(/\[BADGE:(.*?)\]/)?.[1] || "";
                                return <div key={i} className="inline-block px-2 py-0.5 kd-caps text-[9px] tracking-widest text-[#faf9f5] rounded-full mb-4" style={{ backgroundColor: activeVol.themeColor }}>{text.trim()}</div>
                            }
                            if (line.trim() === '') return <br key={i} />
                            return <p key={i} className="text-xs text-[#3d3d3a] leading-relaxed mb-2 opacity-90">{line}</p>
                        })}
                    </div>

                    {/* Page Number Footer */}
                    <div className="absolute bottom-4 right-4 kd-display text-[100px] leading-none opacity-5 pointer-events-none select-none italic text-[#141413]">
                        {selectedPageIdx.toString().padStart(2, '0')}
                    </div>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PageBuilder;

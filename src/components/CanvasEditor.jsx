import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ExternalLink, X } from 'lucide-react';

const GRID_COLS = 4;
const GRID_ROWS = 6;

const defaultLinks = [
  { id: '1', label: 'GitHub', url: 'https://github.com', col: 0, row: 0, color: '#8b5cf6' },
  { id: '2', label: 'Twitter', url: 'https://x.com', col: 1, row: 0, color: '#06b6d4' },
  { id: '3', label: 'Discord', url: 'https://discord.com', col: 2, row: 0, color: '#5865F2' },
  { id: '4', label: 'YouTube', url: 'https://youtube.com', col: 3, row: 0, color: '#ef4444' },
];

const presetColors = ['#8b5cf6','#ec4899','#06b6d4','#10b981','#f59e0b','#ef4444','#6366f1','#14b8a6','#f97316','#84cc16'];

export const CanvasEditor = ({ links: propLinks, onChange }) => {
  const [links, setLinks] = useState(propLinks || defaultLinks);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(null);

  const updateLinks = (newLinks) => {
    setLinks(newLinks);
    onChange?.(newLinks);
  };

  const addLink = () => {
    const id = Date.now().toString();
    const occupied = new Set(links.map(l => `${l.col},${l.row}`));
    let col = 0, row = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!occupied.has(`${c},${r}`)) { col = c; row = r; break; }
      }
    }
    updateLinks([...links, { id, label: 'New Link', url: '', col, row, color: presetColors[links.length % presetColors.length] }]);
    setSelectedId(id);
  };

  const removeLink = (id) => {
    updateLinks(links.filter(l => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateLink = (id, field, value) => {
    updateLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const moveLink = (id, newCol, newRow) => {
    if (newCol < 0 || newCol >= GRID_COLS || newRow < 0 || newRow >= GRID_ROWS) return;
    const occupied = links.find(l => l.id !== id && l.col === newCol && l.row === newRow);
    if (occupied) return;
    updateLinks(links.map(l => l.id === id ? { ...l, col: newCol, row: newRow } : l));
  };

  const selectedLink = links.find(l => l.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
          {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
            const col = i % GRID_COLS;
            const row = Math.floor(i / GRID_COLS);
            const link = links.find(l => l.col === col && l.row === row);
            return (
              <div
                key={i}
                className={`aspect-square rounded-xl border transition-all cursor-pointer flex items-center justify-center relative group ${link ? 'border-white/10 hover:border-white/20' : 'border-dashed border-white/[0.06] hover:border-white/[0.1]'}`}
                style={link ? { background: `${link.color}15` } : {}}
                onClick={() => link ? setSelectedId(link.id === selectedId ? null : link.id) : null}
                draggable={!!link}
                onDragStart={() => link && setDragging(link.id)}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={() => {
                  if (dragging && !link) {
                    moveLink(dragging, col, row);
                    setDragging(null);
                  }
                }}
                onDragEnd={() => setDragging(null)}
              >
                {link ? (
                  <>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); removeLink(link.id); }} className="p-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="text-center px-1">
                      <div className="w-5 h-5 rounded-md mx-auto mb-0.5 flex items-center justify-center" style={{ background: `${link.color}30` }}>
                        <ExternalLink className="w-2.5 h-2.5" style={{ color: link.color }} />
                      </div>
                      <div className="text-[8px] font-semibold text-gray-300 truncate">{link.label}</div>
                    </div>
                    {selectedId === link.id && <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white" style={{ background: link.color }} />}
                  </>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-3 h-3 text-gray-600" /></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedLink && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 space-y-3">
          <h4 className="text-xs font-bold text-white">Edit Link</h4>
          <div className="space-y-2">
            <input type="text" value={selectedLink.label} onChange={e => updateLink(selectedLink.id, 'label', e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/40" placeholder="Label" />
            <input type="text" value={selectedLink.url} onChange={e => updateLink(selectedLink.id, 'url', e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/40" placeholder="URL" />
            <div className="flex gap-1.5 flex-wrap">
              {presetColors.map(c => (
                <button key={c} onClick={() => updateLink(selectedLink.id, 'color', c)} className={`w-6 h-6 rounded-lg border-2 transition-all ${selectedLink.color === c ? 'border-white scale-110' : 'border-transparent hover:border-white/30'}`} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={addLink} className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.08] text-gray-400 text-xs font-semibold hover:border-purple-500/30 hover:text-purple-300 transition-all flex items-center justify-center gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Add Link Tile
      </button>
    </div>
  );
};

export default CanvasEditor;

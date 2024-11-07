import React, { useState } from 'react';
import { Sliders, ChevronUp, ChevronDown } from 'lucide-react';

const VISEMES = [
  { name: 'viseme_aa', label: 'AA (car)' },
  { name: 'viseme_E', label: 'E (bee)' },
  { name: 'viseme_I', label: 'I (see)' },
  { name: 'viseme_O', label: 'O (toe)' },
  { name: 'viseme_U', label: 'U (blue)' },
  { name: 'viseme_CH', label: 'CH (cheese)' },
  { name: 'viseme_DD', label: 'DD (dog)' },
  { name: 'viseme_FF', label: 'FF (fish)' },
  { name: 'viseme_kk', label: 'KK (car)' },
  { name: 'viseme_nn', label: 'NN (nap)' },
  { name: 'viseme_PP', label: 'PP (pop)' },
  { name: 'viseme_RR', label: 'RR (red)' },
  { name: 'viseme_sil', label: 'SIL (silent)' },
  { name: 'viseme_SS', label: 'SS (sea)' },
  { name: 'viseme_TH', label: 'TH (thin)' }
];

interface MorphControlsProps {
  morphTargets: Record<string, number>;
  onMorphTargetChange: (name: string, value: number) => void;
}

export function MorphControls({ morphTargets, onMorphTargetChange }: MorphControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`absolute right-8 top-8 w-72 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white transition-all duration-300 ${isExpanded ? 'h-[500px]' : 'h-auto'}`}>
      <div className="flex justify-between gap-6 mb-8">
        <Sliders size={20} />
        <span className="text-4xl font-sans font-semibold" >&nbsp; Viseme Controls &nbsp;</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-3 h-[calc(100%-4rem)] overflow-y-auto pr-2 custom-scrollbar">
          {VISEMES.map(({ name, label }) => (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <label htmlFor={name}>{label}</label>
                <span className="text-white/60">{(morphTargets[name] || 0).toFixed(2)}</span>
              </div>
              <input
                type="range"
                id={name}
                min="0"
                max="1"
                step="0.01"
                value={morphTargets[name] || 0}
                onChange={(e) => onMorphTargetChange(name, parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-white/20 rounded-lg appearance-none h-2 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

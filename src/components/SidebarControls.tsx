import React, { useState } from 'react';
import { Sliders, AlertTriangle, CheckCircle2, RotateCcw, Gauge, Compass, CheckSquare, Square, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { SystemParameters, ThemeMode } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';
import { ALL_10_OBJECT_SPECS } from '../utils/physicsEngine';

interface SidebarControlsProps {
  selectedObjectIds: string[];
  onToggleObjectSelect: (id: string) => void;
  onSelectPresetGroup: (action: 'all' | 'clear' | 'spheres' | 'cylinders' | 'standard') => void;
  params: SystemParameters;
  onParamChange: (key: keyof SystemParameters, value: number) => void;
  theme: ThemeMode;
  onReset: () => void;
  customMasses?: Record<string, number>;
  customRadii?: Record<string, number>;
  customInnerRatios?: Record<string, number>;
  onCustomMassChange?: (id: string, m: number) => void;
  onCustomRadiusChange?: (id: string, r: number) => void;
  onCustomInnerRatioChange?: (id: string, ratio: number) => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  selectedObjectIds,
  onToggleObjectSelect,
  onSelectPresetGroup,
  params,
  onParamChange,
  theme,
  onReset,
  customMasses = {},
  customRadii = {},
  customInnerRatios = {},
  onCustomMassChange,
  onCustomRadiusChange,
  onCustomInnerRatioChange,
}) => {
  const themeCfg = THEME_CONFIGS[theme];
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(true);

  // Calculate maximum required friction across selected objects
  const thetaRad = (params.angleDeg * Math.PI) / 180;
  const maxMuReq = 0.5 * Math.tan(thetaRad);
  const isSlippingWarning = params.staticFriction < maxMuReq;

  // Currently selected objects specs for quick badge display
  const selectedSpecs = ALL_10_OBJECT_SPECS.filter((spec) =>
    selectedObjectIds.includes(spec.id)
  );

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-3 shrink-0 font-['Inter',sans-serif] relative z-20">
      {/* 1. INLINE COLLAPSIBLE OBJECT ACCORDION (NO FLOATING DARK OVERLAY MODAL) */}
      <div className="w-full flex flex-col gap-2">
        <button
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between gap-2 shadow-sm transition-all font-['Space_Grotesk'] text-xs font-bold border-2 ${
            isAccordionOpen
              ? 'bg-[#f0f9ff] text-[#0f172a] border-[#0284c7] dark:bg-slate-900 dark:text-slate-100 dark:border-cyan-500'
              : 'bg-white text-[#0f172a] dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:border-[#0284c7]'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Settings2 className="w-4 h-4 shrink-0 text-[#0284c7] dark:text-cyan-400" />
            <span className="truncate text-[#0f172a] dark:text-slate-100 font-extrabold">
              Choose Objects to Compare ({selectedObjectIds.length}/10)
            </span>
          </div>
          {isAccordionOpen ? (
            <ChevronUp className="w-4 h-4 shrink-0 text-[#0284c7] dark:text-cyan-400" />
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0 text-slate-600 dark:text-slate-400" />
          )}
        </button>

        {/* INLINE COLLAPSIBLE SELECTION BLOCK */}
        {isAccordionOpen && (
          <div className="p-3 bg-[#f0f9ff] dark:bg-slate-900/90 rounded-2xl border border-sky-200 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
            {/* Quick-toggle links: [Select All] | [Clear] */}
            <div className="flex items-center justify-between text-xs font-mono font-bold px-1">
              <span className="text-[11px] font-extrabold font-['Space_Grotesk'] uppercase text-[#0f172a] dark:text-slate-200">
                Rigid Bodies List:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectPresetGroup('all')}
                  className="text-[#0284c7] dark:text-cyan-400 hover:underline text-[11px] font-bold"
                >
                  [Select All]
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  onClick={() => onSelectPresetGroup('clear')}
                  className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] font-bold"
                >
                  [Clear]
                </button>
              </div>
            </div>

            {/* Quick Category Filters */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => onSelectPresetGroup('spheres')}
                className="py-1 px-2 rounded-lg bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold transition-all text-center"
              >
                Spheres (2)
              </button>
              <button
                onClick={() => onSelectPresetGroup('cylinders')}
                className="py-1 px-2 rounded-lg bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700 font-bold transition-all text-center"
              >
                Cylinders/Discs (4)
              </button>
            </div>

            {/* 10 Rigid Bodies Checkbox List */}
            <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
              {ALL_10_OBJECT_SPECS.map((spec, index) => {
                const isSelected = selectedObjectIds.includes(spec.id);
                return (
                  <button
                    key={spec.id}
                    onClick={() => onToggleObjectSelect(spec.id)}
                    className={`w-full text-left p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-sky-100/90 dark:bg-cyan-950/60 border-2 border-[#0284c7] dark:border-cyan-500 text-[#0f172a] dark:text-slate-100 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#0284c7] dark:text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                        style={{ backgroundColor: spec.color }}
                      />
                      <div className="truncate">
                        <div className="font-extrabold truncate text-[11px] leading-tight text-[#0f172a] dark:text-slate-100">
                          {index + 1}. {spec.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#1e3a8a] dark:text-slate-300 font-bold">
                          {spec.formulaText}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isSelected
                        ? 'bg-[#e0f2fe] text-[#0284c7] border border-sky-300 dark:bg-cyan-900 dark:text-cyan-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      I/mR²={spec.beta.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>


      {/* CARD 2: SYSTEM PARAMETERS (BOLD DARK NAVY LABELS & SOLID BLUE PILL BADGES) */}
      <div className={`rounded-2xl overflow-hidden ${themeCfg.cardClass} shadow-md`}>
        <div className={`px-4 py-2.5 ${themeCfg.cardHeaderClass} flex items-center justify-between border-b border-slate-300 dark:border-slate-800`}>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0284c7] dark:text-cyan-400" />
            <h2 className="text-xs uppercase font-black tracking-wider font-['Space_Grotesk'] text-slate-950 dark:text-slate-100">
              System Parameters
            </h2>
          </div>
          <button
            onClick={onReset}
            className="text-[10px] font-mono font-black text-[#0284c7] dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 text-xs">
          {/* Slider 1: Incline Angle */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-black flex items-center gap-1.5 text-slate-950 dark:text-slate-100 text-xs">
                <Compass className="w-4 h-4 text-[#0284c7] dark:text-cyan-400" />
                Incline Angle (θ)
              </label>
              <span className="font-mono font-black px-2.5 py-0.5 bg-[#0284c7] text-white rounded-md text-xs shadow-xs">
                {params.angleDeg.toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={params.angleDeg}
              onChange={(e) => onParamChange('angleDeg', parseFloat(e.target.value))}
              className={`w-full cursor-pointer h-2.5 bg-slate-300 dark:bg-slate-700 rounded-lg ${themeCfg.sliderTrackClass}`}
            />
            <div className="flex justify-between text-[10px] font-mono font-black text-slate-950 dark:text-slate-100 mt-1">
              <span>5° (Gentle)</span>
              <span>30°</span>
              <span>60° (Steep)</span>
            </div>
          </div>

          {/* Slider 2: Track Length */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-black flex items-center gap-1.5 text-slate-950 dark:text-slate-100 text-xs">
                <Gauge className="w-4 h-4 text-[#0284c7] dark:text-cyan-400" />
                Track Length (L)
              </label>
              <span className="font-mono font-black px-2.5 py-0.5 bg-[#0284c7] text-white rounded-md text-xs shadow-xs">
                {params.trackLength.toFixed(0)}m
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={params.trackLength}
              onChange={(e) => onParamChange('trackLength', parseFloat(e.target.value))}
              className={`w-full cursor-pointer h-2.5 bg-slate-300 dark:bg-slate-700 rounded-lg ${themeCfg.sliderTrackClass}`}
            />
            <div className="flex justify-between text-[10px] font-mono font-black text-slate-950 dark:text-slate-100 mt-1">
              <span>10m</span>
              <span>50m</span>
              <span>100m</span>
            </div>
          </div>

          {/* Slider 3: Static Friction */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-black flex items-center gap-1.5 text-slate-950 dark:text-slate-100 text-xs">
                <span className="text-[#0284c7] dark:text-cyan-400 font-serif font-black text-sm">μ_s</span>
                Static Friction (μ_s)
              </label>
              <span className="font-mono font-black px-2.5 py-0.5 bg-[#0284c7] text-white rounded-md text-xs shadow-xs">
                {params.staticFriction.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.00"
              max="1.00"
              step="0.02"
              value={params.staticFriction}
              onChange={(e) => onParamChange('staticFriction', parseFloat(e.target.value))}
              className={`w-full cursor-pointer h-2.5 bg-slate-300 dark:bg-slate-700 rounded-lg ${themeCfg.sliderTrackClass}`}
            />
            <div className="flex justify-between text-[10px] font-mono font-black text-slate-950 dark:text-slate-100 mt-1">
              <span>0.00 (Smooth)</span>
              <span>0.40 (Default)</span>
              <span>1.00 (Rough)</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: INDIVIDUAL OBJECT CUSTOMIZER (RADIUS, THICKNESS, MASS PER OBJECT) */}
      <div className={`rounded-2xl overflow-hidden ${themeCfg.cardClass} shadow-md`}>
        <button
          onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
          className={`w-full px-4 py-2.5 ${themeCfg.cardHeaderClass} flex items-center justify-between border-b border-slate-300 dark:border-slate-800 text-left`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xs uppercase font-black tracking-wider font-['Space_Grotesk'] text-slate-950 dark:text-slate-100">
              Per-Object Customizer ({selectedSpecs.length})
            </h2>
          </div>
          {isCustomizerOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {isCustomizerOpen && (
          <div className="p-3 flex flex-col gap-3 text-xs max-h-[380px] overflow-y-auto">
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold leading-tight">
              Adjust individual outer radius (R), wall thickness ratio (R_in/R_out), and mass (m) for each chosen object:
            </p>

            {selectedSpecs.map((spec) => {
              const currentR = customRadii[spec.id] !== undefined ? customRadii[spec.id] : params.radius;
              const currentM = customMasses[spec.id] !== undefined ? customMasses[spec.id] : params.mass;
              const currentThick = customInnerRatios[spec.id] !== undefined
                ? customInnerRatios[spec.id]
                : (spec.defaultInnerRatio !== undefined ? spec.defaultInnerRatio : 0.0);
              const currentInnerR = currentR * currentThick;

              return (
                <div
                  key={spec.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-black font-['Space_Grotesk'] text-slate-900 dark:text-slate-100 text-[11px]">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: spec.color }}
                      />
                      {spec.shortName} ({spec.name})
                    </div>
                  </div>

                  {/* Outer Radius Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                      <span>Outer Radius (R_out):</span>
                      <span className="font-mono text-[#0284c7] dark:text-cyan-400 font-black">{currentR.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="1.00"
                      step="0.05"
                      value={currentR}
                      onChange={(e) => onCustomRadiusChange && onCustomRadiusChange(spec.id, parseFloat(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg accent-[#0284c7]"
                    />
                  </div>

                  {/* Inner Radius Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                      <span>Inner Radius (R_in):</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-black">
                        {currentInnerR.toFixed(2)}m <span className="text-[9px] text-slate-500 font-normal">({(currentThick * 100).toFixed(0)}% shell)</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max={(currentR * 0.95).toFixed(2)}
                      step="0.01"
                      value={currentInnerR}
                      onChange={(e) => {
                        const newInR = parseFloat(e.target.value);
                        const ratio = currentR > 0 ? newInR / currentR : 0;
                        if (onCustomInnerRatioChange) {
                          onCustomInnerRatioChange(spec.id, Math.min(Math.max(ratio, 0), 0.95));
                        }
                      }}
                      className="w-full cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg accent-purple-600"
                    />
                  </div>

                  {/* Mass Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                      <span>Mass (m):</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{currentM.toFixed(1)}kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="10.0"
                      step="0.5"
                      value={currentM}
                      onChange={(e) => onCustomMassChange && onCustomMassChange(spec.id, parseFloat(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg accent-emerald-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

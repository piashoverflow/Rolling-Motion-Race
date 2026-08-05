import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Activity, Layers, BookOpen, Box } from 'lucide-react';
import { TabMode, ThemeMode, PresetMode, CanvasViewMode } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';

interface HeaderBarProps {
  currentTab: TabMode;
  onTabChange: (tab: TabMode) => void;
  viewMode: CanvasViewMode;
  onViewModeChange: (mode: CanvasViewMode) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  preset: PresetMode;
  onPresetChange: (preset: PresetMode) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  theme,
  onThemeChange,
  preset,
  onPresetChange,
  isRunning,
  onToggleRun,
  onReset,
  soundEnabled,
  onToggleSound,
  onToggleFullscreen,
}) => {
  const themeCfg = THEME_CONFIGS[theme];

  return (
    <header className={`w-full px-4 py-2.5 border-b ${themeCfg.borderClass} ${themeCfg.cardClass} flex flex-wrap items-center justify-between gap-3 shadow-md transition-colors duration-200 z-30 relative`}>
      {/* Left Application Title & Top-Left Navigation Tabs (Placed directly under title) */}
      <div className="flex flex-col items-start gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-black font-['Space_Grotesk'] tracking-tight leading-none text-slate-950 dark:text-slate-100">
              Moment of Inertia & Rolling Motion Race
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#0284c7] text-white font-extrabold shadow-2xs">
              v2.5
            </span>
          </div>
          <p className="text-[11px] font-mono font-black text-slate-900 dark:text-slate-200 mt-0.5">
            PHYSICS DYNAMICS LAB • INCLINE ROLLING SIMULATOR
          </p>
        </div>

        {/* Navigation Tabs (Top-Left under/beside title): Universal Ramp | Energy Split Map | Equations & FBD */}
        <nav className="flex items-center bg-slate-200 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => onTabChange('race')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all font-['Space_Grotesk'] ${
              currentTab === 'race'
                ? 'bg-[#0284c7] text-white shadow-sm'
                : 'text-slate-950 dark:text-slate-200 hover:text-[#0284c7] hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Universal Ramp
          </button>

          <button
            onClick={() => onTabChange('energy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all font-['Space_Grotesk'] ${
              currentTab === 'energy'
                ? 'bg-[#0284c7] text-white shadow-sm'
                : 'text-slate-950 dark:text-slate-200 hover:text-[#0284c7] hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Energy Split Map
          </button>

          <button
            onClick={() => onTabChange('equations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all font-['Space_Grotesk'] ${
              currentTab === 'equations'
                ? 'bg-[#0284c7] text-white shadow-sm'
                : 'text-slate-950 dark:text-slate-200 hover:text-[#0284c7] hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Equations & FBD
          </button>
        </nav>
      </div>

      {/* Right Controls & Strict Top-Right Branding */}
      <div className="flex items-center flex-wrap gap-2.5 ml-auto">
        {/* Quick Presets Menu */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-200 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
          <span className="text-[10px] font-mono text-slate-950 dark:text-slate-200 px-1 font-black uppercase">
            QUICK:
          </span>
          <button
            onClick={() => onPresetChange('preset_all_in_one')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black transition-all ${
              preset === 'preset_all_in_one'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-sky-50'
            }`}
          >
            All in One
          </button>
          <button
            onClick={() => onPresetChange('preset_spheres')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black transition-all ${
              preset === 'preset_spheres'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-sky-50'
            }`}
          >
            Spheres Only
          </button>
          <button
            onClick={() => onPresetChange('preset_cylinders')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black transition-all ${
              preset === 'preset_cylinders'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-sky-50'
            }`}
          >
            Cylinders Only
          </button>

          <button
            onClick={onReset}
            className="p-1.5 ml-1 rounded-lg text-slate-950 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-[#0284c7] hover:text-white transition-all shadow-xs"
            title="Reset Race (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Buttons (Bright & Dark only) */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
          {(['bright', 'dark'] as ThemeMode[]).map((t) => (
            <button
              key={t}
              onClick={() => onThemeChange(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black uppercase transition-all ${
                theme === t
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-sky-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Extra Utilities */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg text-xs transition-colors border ${
              soundEnabled
                ? 'text-[#0284c7] dark:text-cyan-400 bg-sky-100 border-sky-300 dark:bg-cyan-950 dark:border-cyan-800'
                : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg text-slate-950 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* STRICT TOP-RIGHT BRANDING: UDVASH - MATH & PHYSICS DYNAMICS LAB */}
        <div className="flex items-center gap-2 pl-3 border-l-2 border-slate-300 dark:border-slate-700 shrink-0">
          <div className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded-md italic font-['Space_Grotesk'] tracking-wider shadow-xs">
            UDVASH
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100 uppercase tracking-tight">
              UDVASH MATH & PHYSICS
            </span>
            <span className="text-[9px] font-mono font-black text-[#0284c7] dark:text-cyan-400 uppercase tracking-widest mt-0.5">
              DYNAMICS LAB
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


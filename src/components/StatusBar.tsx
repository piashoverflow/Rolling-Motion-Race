import React from 'react';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ThemeMode } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';

interface StatusBarProps {
  theme: ThemeMode;
  fps: number;
  isRunning: boolean;
  isFinished: boolean;
  isSlipping: boolean;
  currentTime: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  theme,
  fps,
  isRunning,
  isFinished,
  isSlipping,
  currentTime,
}) => {
  const themeCfg = THEME_CONFIGS[theme];

  let statusText = 'RACE READY • ALL OBJECTS AT START LINE';
  if (isFinished) {
    statusText = `RACE COMPLETED • ALL OBJECTS FINISHED AT t = ${currentTime.toFixed(2)}s`;
  } else if (isRunning) {
    statusText = isSlipping
      ? 'WARNING: KINETIC SLIPPING OCCURRING ON OBJECTS WITH HIGH INERTIA'
      : 'RACE IN PROGRESS: PURE ROLLING WITHOUT SLIPPING';
  }

  return (
    <footer
      className={`w-full px-4 py-2 border-t ${themeCfg.borderClass} ${themeCfg.cardClass} flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-inner z-20`}
    >
      {/* Left Engine Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-black text-slate-950 dark:text-slate-100 font-['Space_Grotesk']">
            PHYSICS ENGINE ACTIVE
          </span>
        </div>

        <span className="text-slate-400">|</span>

        <div className="flex items-center gap-1 text-slate-900 dark:text-slate-300 font-bold">
          <Activity className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400" />
          <span>RENDER FPS: {fps}</span>
        </div>
      </div>

      {/* Center Live Indicator */}
      <div className="flex items-center gap-2 text-[#0284c7] dark:text-cyan-400 font-black uppercase tracking-wide">
        {isSlipping ? (
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        )}
        <span>{statusText}</span>
      </div>

      {/* Right Branding & Status Badge */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-900 dark:text-slate-300 font-['Space_Grotesk'] font-black hidden md:inline">
          UDVASH HSC & BUET MECHANICS
        </span>

        <span
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-['Space_Grotesk'] uppercase tracking-wider ${
            isFinished
              ? 'bg-emerald-500 text-slate-950'
              : isRunning
              ? 'bg-cyan-500 text-slate-950 animate-pulse'
              : 'bg-slate-700 text-slate-200'
          }`}
        >
          {isFinished ? 'FINISHED' : isRunning ? 'RUNNING' : 'RACE READY'}
        </span>
      </div>
    </footer>
  );
};

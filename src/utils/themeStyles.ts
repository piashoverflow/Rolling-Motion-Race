import { ThemeMode } from '../types';

export interface ThemeConfig {
  mode: ThemeMode;
  name: string;
  bgClass: string;
  cardClass: string;
  cardHeaderClass: string;
  textPrimary: string;
  textSecondary: string;
  borderClass: string;
  accentCyan: string;
  badgeClass: string;
  sliderTrackClass: string;
  
  // Canvas Colors
  canvasBg: string;
  canvasRampFill: string;
  canvasRampStroke: string;
  canvasTrussColor: string;
  canvasText: string;
  canvasGridLines: string;
  canvasOverlayBg: string;
  canvasOverlayBorder: string;
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  bright: {
    mode: 'bright',
    name: 'Bright',
    bgClass: 'bg-[#eef5fb] text-slate-950 font-bold',
    cardClass: 'bg-white border-2 border-slate-300 shadow-md',
    cardHeaderClass: 'bg-sky-50 border-b-2 border-slate-300 text-slate-950 font-black',
    textPrimary: 'text-slate-950 font-black',
    textSecondary: 'text-slate-900 font-bold',
    borderClass: 'border-slate-300',
    accentCyan: '#0284c7',
    badgeClass: 'bg-[#0284c7] text-white font-black shadow-xs',
    sliderTrackClass: 'accent-sky-700',

    canvasBg: '#eef5fb',
    canvasRampFill: '#0284c7',
    canvasRampStroke: '#0f172a',
    canvasTrussColor: '#0369a1',
    canvasText: '#0f172a',
    canvasGridLines: 'rgba(15, 23, 42, 0.2)',
    canvasOverlayBg: 'rgba(255, 255, 255, 0.95)',
    canvasOverlayBorder: 'rgba(2, 132, 199, 0.6)',
  },

  dark: {
    mode: 'dark',
    name: 'Dark',
    bgClass: 'bg-[#090d16] text-slate-100',
    cardClass: 'bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 shadow-xl shadow-cyan-950/40',
    cardHeaderClass: 'bg-slate-800/60 border-b border-cyan-500/20 text-cyan-300 font-semibold',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    borderClass: 'border-cyan-500/30',
    accentCyan: '#00f2fe',
    badgeClass: 'bg-cyan-500 text-slate-950 font-bold',
    sliderTrackClass: 'accent-cyan-400',

    canvasBg: '#090d16',
    canvasRampFill: '#0f172a',
    canvasRampStroke: '#00f2fe',
    canvasTrussColor: '#0284c7',
    canvasText: '#f1f5f9',
    canvasGridLines: 'rgba(0, 242, 254, 0.1)',
    canvasOverlayBg: 'rgba(15, 23, 42, 0.9)',
    canvasOverlayBorder: 'rgba(0, 242, 254, 0.4)',
  },

  cyber: {
    mode: 'cyber',
    name: 'Cyber',
    bgClass: 'bg-[#06020a] text-yellow-100',
    cardClass: 'bg-[#0f0418]/90 backdrop-blur-md border border-fuchsia-500/50 shadow-2xl shadow-fuchsia-950/60',
    cardHeaderClass: 'bg-fuchsia-950/40 border-b border-fuchsia-500/30 text-yellow-400 font-bold',
    textPrimary: 'text-yellow-100',
    textSecondary: 'text-fuchsia-300',
    borderClass: 'border-fuchsia-500/40',
    accentCyan: '#facc15',
    badgeClass: 'bg-fuchsia-600 text-yellow-300 font-bold',
    sliderTrackClass: 'accent-fuchsia-500',

    canvasBg: '#06020a',
    canvasRampFill: '#1f0732',
    canvasRampStroke: '#ec4899',
    canvasTrussColor: '#facc15',
    canvasText: '#fef08a',
    canvasGridLines: 'rgba(236, 72, 153, 0.15)',
    canvasOverlayBg: 'rgba(15, 4, 24, 0.92)',
    canvasOverlayBorder: 'rgba(236, 72, 153, 0.5)',
  },
};

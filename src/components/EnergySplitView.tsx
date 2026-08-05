import React from 'react';
import { RollingObject, SystemParameters, ThemeMode } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';
import { Zap, Activity, Info, BarChart3, ShieldCheck } from 'lucide-react';

interface EnergySplitViewProps {
  objects: RollingObject[];
  params: SystemParameters;
  theme: ThemeMode;
}

export const EnergySplitView: React.FC<EnergySplitViewProps> = ({
  objects,
  params,
  theme,
}) => {
  const themeCfg = THEME_CONFIGS[theme];

  return (
    <div className="flex flex-col gap-6 font-['Inter',sans-serif]">
      {/* Top Banner Overview */}
      <div className={`p-5 rounded-2xl ${themeCfg.cardClass} shadow-lg border ${themeCfg.borderClass}`}>
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-amber-500" />
          <h2 className="text-lg font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100">
            Energy Split Map & Mechanical Energy Conversion
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-900 dark:text-slate-200 font-bold leading-relaxed max-w-4xl">
          When an object rolls down an incline without slipping, gravitational potential energy (E_p = mgh) converts completely into mechanical kinetic energy. However, this kinetic energy is split into two forms: <strong className="text-[#0284c7] dark:text-cyan-400 font-black">Translational Kinetic Energy (K_trans = ½ m v²)</strong> and <strong className="text-amber-700 dark:text-amber-400 font-black">Rotational Kinetic Energy (K_rot = ½ I ω²)</strong>.
        </p>
      </div>

      {/* Grid of Energy Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Real-Time Live Energy Partition per Object */}
        <div className={`p-5 rounded-2xl ${themeCfg.cardClass} border ${themeCfg.borderClass} flex flex-col gap-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-300 dark:border-slate-800">
            <h3 className="text-sm font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0284c7] dark:text-cyan-400" />
              Live Energy Breakdown (Joules)
            </h3>
            <span className="text-[10px] font-mono font-black text-slate-900 dark:text-slate-300">Total E = mgh</span>
          </div>

          <div className="flex flex-col gap-4">
            {objects.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                No rigid bodies selected. Select objects from the sidebar to view live energy breakdown.
              </div>
            ) : (
              objects.map((obj) => {
              const keTotal = obj.keTrans + obj.keRot;
              const totalE = Math.max(0.1, obj.pe + keTotal);

              const pePct = (obj.pe / totalE) * 100;
              const transPct = (obj.keTrans / totalE) * 100;
              const rotPct = (obj.keRot / totalE) * 100;

              return (
                <div key={obj.id} className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-black font-['Space_Grotesk'] text-xs text-slate-950 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: obj.color }} />
                      {obj.name}
                    </span>
                    <span className="font-mono text-xs text-[#0284c7] dark:text-cyan-400 font-black">
                      I/mR² = {obj.beta.toFixed(2)} ({obj.formulaText})
                    </span>
                  </div>

                  {/* Stacked Energy Bar */}
                  <div className="w-full h-4 bg-slate-800 rounded-lg overflow-hidden flex border border-slate-700 mb-2">
                    <div
                      style={{ width: `${pePct}%` }}
                      className="h-full bg-blue-500 transition-all duration-100 flex items-center justify-center text-[9px] font-mono text-white font-bold"
                      title={`PE: ${obj.pe.toFixed(1)} J`}
                    >
                      {pePct > 10 ? 'PE' : ''}
                    </div>
                    <div
                      style={{ width: `${transPct}%` }}
                      className="h-full bg-emerald-500 transition-all duration-100 flex items-center justify-center text-[9px] font-mono text-slate-950 font-bold"
                      title={`K_trans: ${obj.keTrans.toFixed(1)} J`}
                    >
                      {transPct > 10 ? 'K_trans' : ''}
                    </div>
                    <div
                      style={{ width: `${rotPct}%` }}
                      className="h-full bg-amber-500 transition-all duration-100 flex items-center justify-center text-[9px] font-mono text-slate-950 font-bold"
                      title={`K_rot: ${obj.keRot.toFixed(1)} J`}
                    >
                      {rotPct > 10 ? 'K_rot' : ''}
                    </div>
                  </div>

                  {/* Energy Numbers Grid */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                    <div className="bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-300 font-black">
                      <div>Potential (PE)</div>
                      <div className="font-black text-xs">{obj.pe.toFixed(1)} J</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 font-black">
                      <div>Translational</div>
                      <div className="font-black text-xs">{obj.keTrans.toFixed(1)} J</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-300 font-black">
                      <div>Rotational</div>
                      <div className="font-black text-xs">{obj.keRot.toFixed(1)} J</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>

        {/* Right Column: Theoretical Percentage Split & Physics Insight */}
        <div className={`p-5 rounded-2xl ${themeCfg.cardClass} border ${themeCfg.borderClass} flex flex-col gap-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-300 dark:border-slate-800">
            <h3 className="text-sm font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Theoretical Energy Partition Ratios
            </h3>
            <span className="text-[10px] font-mono font-black text-slate-900 dark:text-slate-300">K_rot / K_trans = I / mR²</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {objects.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                No rigid bodies selected.
              </div>
            ) : (
              objects.map((obj) => {
              const pctTrans = (1 / (1 + obj.beta)) * 100;
              const pctRot = (obj.beta / (1 + obj.beta)) * 100;

              return (
                <div key={obj.id} className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100">{obj.name}</span>
                    <span className="font-mono font-black text-[#0284c7] dark:text-cyan-400">{pctTrans.toFixed(1)}% Linear Speed</span>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                    <div style={{ width: `${pctTrans}%` }} className="bg-emerald-500" />
                    <div style={{ width: `${pctRot}%` }} className="bg-amber-500" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-black text-slate-900 dark:text-slate-300 mt-1">
                    <span>Linear (K_trans): {pctTrans.toFixed(1)}%</span>
                    <span>Spin (K_rot): {pctRot.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

          {/* Key BUET / HSC Insight Box */}
          <div className="p-4 bg-sky-50 dark:bg-cyan-950/40 border-2 border-[#0284c7] dark:border-cyan-500 rounded-xl flex items-start gap-3 mt-2">
            <Info className="w-5 h-5 text-[#0284c7] dark:text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-black text-[#0284c7] dark:text-cyan-300 font-['Space_Grotesk'] uppercase mb-1">
                BUET Dynamics Lab Core Insight
              </div>
              <p className="text-slate-950 dark:text-slate-200 font-bold leading-relaxed text-[11px]">
                The object with the <strong className="text-[#0284c7] dark:text-cyan-300 font-black">smallest Moment of Inertia (I) relative to mR²</strong> converts the maximum fraction of potential energy into linear motion (K_trans), resulting in the highest linear acceleration (a) and reaching the finish line first!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

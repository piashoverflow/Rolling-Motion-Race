import React, { useRef, useEffect, useState } from 'react';
import { SystemParameters, ThemeMode } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';
import { BookOpen, Calculator, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

interface EquationsFBDViewProps {
  params: SystemParameters;
  theme: ThemeMode;
}

export const EquationsFBDView: React.FC<EquationsFBDViewProps> = ({ params, theme }) => {
  const fbdCanvasRef = useRef<HTMLCanvasElement>(null);
  const themeCfg = THEME_CONFIGS[theme];

  // Interactive Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Custom equation solver state
  const [calcBeta, setCalcBeta] = useState<number>(0.4); // Solid sphere
  const [calcAngle, setCalcAngle] = useState<number>(20);
  const [calcLength, setCalcLength] = useState<number>(30);

  // FBD Canvas render
  useEffect(() => {
    const canvas = fbdCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = themeCfg.canvasBg;
    ctx.fillRect(0, 0, width, height);

    const angleRad = (params.angleDeg * Math.PI) / 180;

    // Center point of incline
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    // Draw Incline Line
    const rampLen = 300;
    const startX = centerX - (rampLen / 2) * Math.cos(angleRad);
    const startY = centerY - (rampLen / 2) * Math.sin(angleRad);
    const endX = centerX + (rampLen / 2) * Math.cos(angleRad);
    const endY = centerY + (rampLen / 2) * Math.sin(angleRad);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Fill triangle underneath
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(startX, endY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctx.fill();

    // Circle sitting ON TOP of ramp (Normal vector points OUT of ramp surface: sin θ, -cos θ)
    const R = 45;
    const normX = Math.sin(angleRad);
    const normY = -Math.cos(angleRad); // Negative Y points UP in Canvas coordinates!

    const circleX = centerX + normX * R;
    const circleY = centerY + normY * R;

    // Circle Body
    ctx.beginPath();
    ctx.arc(circleX, circleY, R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center axle dot
    ctx.beginPath();
    ctx.arc(circleX, circleY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // --- FORCES ---
    // 1. Weight Vector W = mg (vertical down from center)
    ctx.beginPath();
    ctx.moveTo(circleX, circleY);
    ctx.lineTo(circleX, circleY + 75);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(circleX, circleY + 75);
    ctx.lineTo(circleX - 5, circleY + 65);
    ctx.lineTo(circleX + 5, circleY + 65);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.fillText('W = mg', circleX + 10, circleY + 70);

    // W_parallel = mg sin(theta) (down incline from center)
    const rampX = Math.cos(angleRad);
    const rampY = Math.sin(angleRad);

    ctx.beginPath();
    ctx.moveTo(circleX, circleY);
    ctx.lineTo(circleX + rampX * 60, circleY + rampY * 60);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('mg sin θ', circleX + rampX * 60 + 5, circleY + rampY * 60);

    // W_perpendicular = mg cos(theta) (into incline from center: -norm)
    ctx.beginPath();
    ctx.moveTo(circleX, circleY);
    ctx.lineTo(circleX - normX * 55, circleY - normY * 55);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('mg cos θ', circleX - normX * 65, circleY - normY * 65);

    // 2. Normal Force N (from contact point OUTWARD away from ramp)
    const contactX = centerX;
    const contactY = centerY;

    ctx.beginPath();
    ctx.moveTo(contactX, contactY);
    ctx.lineTo(contactX + normX * 70, contactY + normY * 70);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(contactX + normX * 70, contactY + normY * 70);
    ctx.lineTo(contactX + normX * 60 - rampX * 4, contactY + normY * 60 - rampY * 4);
    ctx.lineTo(contactX + normX * 60 + rampX * 4, contactY + normY * 60 + rampY * 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillText('N', contactX + normX * 80, contactY + normY * 80);

    // 3. Static Friction f_s at contact point pointing UP the incline
    ctx.beginPath();
    ctx.moveTo(contactX, contactY);
    ctx.lineTo(contactX - rampX * 55, contactY - rampY * 55);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(contactX - rampX * 55, contactY - rampY * 55);
    ctx.lineTo(contactX - rampX * 45 + normX * 4, contactY - rampY * 45 + normY * 4);
    ctx.lineTo(contactX - rampX * 45 - normX * 4, contactY - rampY * 45 - normY * 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillText('f_s (friction)', contactX - rampX * 80 - 10, contactY - rampY * 60);

    ctx.restore();
  }, [params, theme]);

  // Solver calculations
  const calcA = (9.81 * Math.sin((calcAngle * Math.PI) / 180)) / (1 + calcBeta);
  const calcTime = Math.sqrt((2 * calcLength) / calcA);
  const calcVTop = Math.sqrt(2 * calcA * calcLength);
  const calcMuReq = (calcBeta / (1 + calcBeta)) * Math.tan((calcAngle * Math.PI) / 180);

  return (
    <div className="flex flex-col gap-6 font-['Inter',sans-serif]">
      {/* Top Banner Header */}
      <div className={`p-5 rounded-2xl ${themeCfg.cardClass} border ${themeCfg.borderClass} shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-[#0284c7] dark:text-cyan-400" />
          <h2 className="text-lg font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100">
            Free Body Diagram (FBD) & Analytical Derivation
          </h2>
        </div>
        <p className="text-xs text-slate-900 dark:text-slate-200 font-bold leading-relaxed">
          Full step-by-step mathematical breakdown for BUET & HSC Physics examination problems. Understand how Newton&apos;s 2nd Law for translation and rotational torque combine to dictate rolling acceleration down an incline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* FBD Canvas Diagram */}
        <div className={`p-5 rounded-2xl ${themeCfg.cardClass} border ${themeCfg.borderClass} flex flex-col gap-3`}>
          <h3 className="text-sm font-black font-['Space_Grotesk'] text-[#0284c7] dark:text-cyan-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] dark:bg-cyan-500" />
            Interactive Free Body Diagram (FBD)
          </h3>
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-950">
            <canvas ref={fbdCanvasRef} width={500} height={320} className="w-full h-full block" />
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-300">
            * Note: $f_s$ acts UP the incline at contact point, producing clockwise torque $\tau = f_s R$ around the center of mass!
          </div>
        </div>

        {/* Analytical Step-by-Step Equations */}
        <div className={`p-5 rounded-2xl ${themeCfg.cardClass} border ${themeCfg.borderClass} flex flex-col gap-4 text-xs`}>
          <h3 className="text-sm font-black font-['Space_Grotesk'] text-[#0284c7] dark:text-cyan-300 border-b pb-2 border-slate-300 dark:border-slate-800">
            Step-by-Step Derivation
          </h3>

          <div className="flex flex-col gap-3 font-mono">
            {/* Step 1 */}
            <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-800">
              <span className="text-[#0284c7] dark:text-cyan-400 font-black">1. Translational Motion (Newton&apos;s 2nd Law):</span>
              <p className="text-slate-950 dark:text-slate-100 font-black mt-1 font-sans">
                mg sin(θ) - f_s = m · a  ⟹  f_s = mg sin(θ) - m · a
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-800">
              <span className="text-amber-700 dark:text-amber-400 font-black">2. Rotational Motion (Torque about CM):</span>
              <p className="text-slate-950 dark:text-slate-100 font-black mt-1 font-sans">
                τ = f_s · R = I · α
              </p>
              <p className="text-[11px] text-slate-800 dark:text-slate-300 font-bold mt-1">
                Since I is proportional to m · R² and pure rolling implies α = a / R:
              </p>
              <p className="text-slate-950 dark:text-slate-100 font-black mt-1 font-sans">
                f_s · R = I · (a / R)  ⟹  f_s = (I / R²) · a = (I / mR²) · m · a
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800">
              <span className="text-emerald-800 dark:text-emerald-400 font-black">3. Final Linear Acceleration Formula:</span>
              <p className="text-emerald-950 dark:text-emerald-300 font-black mt-1 text-sm">
                mg sin(θ) - (I / mR²) · m · a = m · a  ⟹  a = [g sin(θ)] / [1 + I/mR²]
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Formula Solver & BUET Practice Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Formula Calculator */}
        <div className={`p-5 rounded-2xl ${themeCfg.cardClass} border ${themeCfg.borderClass} flex flex-col gap-4 text-xs`}>
          <div className="flex items-center gap-2 border-b pb-2 border-slate-300 dark:border-slate-800">
            <Calculator className="w-5 h-5 text-[#0284c7] dark:text-cyan-400" />
            <h3 className="text-sm font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100">Interactive Acceleration & Time Calculator</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-black block text-[11px] mb-1 text-slate-950 dark:text-slate-100">Body Geometry (I/mR²):</label>
              <select
                value={calcBeta}
                onChange={(e) => setCalcBeta(parseFloat(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs"
              >
                <option value={0.4}>Solid Sphere (I/mR² = 0.40)</option>
                <option value={0.5}>Solid Disc / Cylinder (I/mR² = 0.50)</option>
                <option value={0.667}>Hollow Sphere (I/mR² = 0.67)</option>
                <option value={1.0}>Thin Ring / Hoop (I/mR² = 1.00)</option>
              </select>
            </div>

            <div>
              <label className="font-black block text-[11px] mb-1 text-slate-950 dark:text-slate-100">Angle (θ deg):</label>
              <input
                type="number"
                value={calcAngle}
                onChange={(e) => setCalcAngle(parseFloat(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="font-black block text-[11px] mb-1 text-slate-950 dark:text-slate-100">Length (L meters):</label>
              <input
                type="number"
                value={calcLength}
                onChange={(e) => setCalcLength(parseFloat(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center pt-2">
            <div className="bg-sky-50 dark:bg-cyan-950/40 p-2 rounded-lg border border-sky-200 dark:border-cyan-800">
              <div className="text-[10px] text-slate-900 font-black">Acceleration (a)</div>
              <div className="font-black text-[#0284c7] dark:text-cyan-400 text-sm">{calcA.toFixed(2)} m/s²</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="text-[10px] text-slate-900 font-black">Finish Time (t)</div>
              <div className="font-black text-emerald-700 dark:text-emerald-400 text-sm">{calcTime.toFixed(2)} s</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="text-[10px] text-slate-900 font-black">Top Speed (v_max)</div>
              <div className="font-black text-amber-700 dark:text-amber-400 text-sm">{calcVTop.toFixed(2)} m/s</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-[10px] text-slate-900 font-black">Req. Static μ_req</div>
              <div className="font-black text-purple-700 dark:text-purple-400 text-sm">{calcMuReq.toFixed(3)}</div>
            </div>
          </div>
        </div>

        {/* BUET / HSC Practice Quiz Card */}
        <div className={`p-5 rounded-2xl ${themeCfg.cardClass} border ${themeCfg.borderClass} flex flex-col gap-3 text-xs`}>
          <div className="flex items-center gap-2 border-b pb-2 border-slate-300 dark:border-slate-800">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black font-['Space_Grotesk'] text-slate-950 dark:text-slate-100">BUET Admission Practice Question</h3>
          </div>

          <p className="font-black text-slate-950 dark:text-slate-100 leading-snug">
            Q: If a solid sphere of mass 2 kg, radius 0.5 m and a solid sphere of mass 10 kg, radius 2.0 m roll down the same incline simultaneously, which one reaches the bottom first?
          </p>

          <div className="flex flex-col gap-2 my-1 font-mono">
            {[
              'A) The 10 kg sphere (larger mass & radius)',
              'B) The 2 kg sphere (smaller inertia)',
              'C) Both reach the finish line at the EXACT SAME TIME!',
              'D) Depends on kinetic friction coefficient',
            ].map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedAnswer(idx);
                  setShowFeedback(true);
                }}
                className={`p-2.5 rounded-lg text-left border font-black transition-all ${
                  selectedAnswer === idx
                    ? idx === 2
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 border-rose-500 text-rose-950 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-950 dark:text-slate-100 hover:border-[#0284c7]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {showFeedback && (
            <div
              className={`p-3 rounded-lg border text-xs leading-relaxed font-bold ${
                selectedAnswer === 2
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-100 border-amber-500 text-amber-950 dark:bg-amber-950 dark:text-amber-200'
              }`}
            >
              {selectedAnswer === 2 ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-black">CORRECT!</strong> Linear acceleration a = [g sin(θ)] / [1 + I/mR²] depends ONLY on shape ratio I/mR² = 0.40 for solid spheres. Mass m and radius R cancel out completely!
                  </div>
                </div>
              ) : (
                <div>
                  <strong className="font-black">INCORRECT.</strong> Remember: a = [g sin(θ)] / [1 + I/mR²]. Neither mass m nor radius R appears in the acceleration equation! Try option C.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

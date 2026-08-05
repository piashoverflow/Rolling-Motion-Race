import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeMode, TabMode, PresetMode, SystemParameters, RollingObject, CanvasViewMode } from './types';
import { THEME_CONFIGS } from './utils/themeStyles';
import { createInitialObjects, updatePhysicsState } from './utils/physicsEngine';
import { audioSynth } from './utils/audioSynth';
import { HeaderBar } from './components/HeaderBar';
import { SidebarControls } from './components/SidebarControls';
import { RaceCanvas } from './components/RaceCanvas';
import { EnergySplitView } from './components/EnergySplitView';
import { EquationsFBDView } from './components/EquationsFBDView';
import { StatusBar } from './components/StatusBar';

export default function App() {
  // Global Application State
  const [theme, setTheme] = useState<ThemeMode>('bright'); // Default Bright as in reference image
  const [currentTab, setCurrentTab] = useState<TabMode>('race');
  const [viewMode, setViewMode] = useState<CanvasViewMode>('2d');
  const [preset, setPreset] = useState<PresetMode>('custom_selection');

  // Sync theme with HTML root class
  useEffect(() => {
    if (theme === 'bright') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // System Physics Parameters
  const [params, setParams] = useState<SystemParameters>({
    angleDeg: 20, // 5 to 60
    trackLength: 30, // 10 to 100
    mass: 2.0, // 0.5 to 10
    radius: 0.3, // 0.1 to 1.0
    staticFriction: 0.4, // 0.00 to 1.00
    kineticFriction: 0.3, // 0.00 to 0.80
    gravity: 9.81,
    timeScale: 1.0,
  });

  // Custom Mode per-object overrides
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>(['solid_sphere']);

  const [customMasses, setCustomMasses] = useState<Record<string, number>>({});

  const [customRadii, setCustomRadii] = useState<Record<string, number>>({});

  const [customInnerRatios, setCustomInnerRatios] = useState<Record<string, number>>({});

  // Race Runtime State
  const [objects, setObjects] = useState<RollingObject[]>(() =>
    createInitialObjects(['solid_sphere'], params, customMasses, customRadii, customInnerRatios)
  );

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  // Animation Frame references
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsCalcRef = useRef<number>(performance.now());

  // Re-initialize objects when parameters or selection change
  const reinitObjects = useCallback(
    (newSelectedIds = selectedObjectIds, newParams = params, newMasses = customMasses, newRadii = customRadii, newRatios = customInnerRatios) => {
      setObjects(createInitialObjects(newSelectedIds, newParams, newMasses, newRadii, newRatios));
      setCurrentTime(0);
      setIsRunning(false);
    },
    [selectedObjectIds, params, customMasses, customRadii, customInnerRatios]
  );

  // Toggle Object selection from Multi-Select UI
  const handleToggleObjectSelect = (id: string) => {
    let updated: string[];
    if (selectedObjectIds.includes(id)) {
      updated = selectedObjectIds.filter((item) => item !== id);
    } else {
      updated = [...selectedObjectIds, id];
    }
    setSelectedObjectIds(updated);
    setPreset('custom_selection');
    setObjects(createInitialObjects(updated, params, customMasses, customRadii, customInnerRatios));
    setCurrentTime(0);
    setIsRunning(false);
  };

  // Group quick selector
  const handleSelectPresetGroup = (group: 'all' | 'clear' | 'spheres' | 'cylinders' | 'standard') => {
    let newIds: string[];
    if (group === 'all') {
      newIds = [
        'solid_sphere',
        'hollow_sphere',
        'solid_disc',
        'solid_cylinder',
        'hollow_cylinder',
        'ring',
      ];
    } else if (group === 'clear') {
      newIds = [];
    } else if (group === 'spheres') {
      newIds = ['solid_sphere', 'hollow_sphere'];
    } else if (group === 'cylinders') {
      newIds = [
        'solid_disc',
        'solid_cylinder',
        'hollow_cylinder',
        'ring',
      ];
    } else {
      newIds = ['solid_sphere', 'solid_disc', 'solid_cylinder', 'hollow_sphere', 'ring'];
    }
    setSelectedObjectIds(newIds);
    setPreset('custom_selection');
    setObjects(createInitialObjects(newIds, params, customMasses, customRadii, customInnerRatios));
    setCurrentTime(0);
    setIsRunning(false);
  };

  // Reset Race
  const handleReset = useCallback(() => {
    reinitObjects();
  }, [reinitObjects]);

  // Handle Preset Selection
  const handlePresetChange = (newPreset: PresetMode) => {
    setPreset(newPreset);
    if (newPreset === 'preset_all_in_one') {
      handleSelectPresetGroup('all');
    } else if (newPreset === 'preset_spheres') {
      handleSelectPresetGroup('spheres');
    } else if (newPreset === 'preset_cylinders') {
      handleSelectPresetGroup('cylinders');
    } else if (newPreset === 'preset_4_objects') {
      handleSelectPresetGroup('standard');
    } else {
      setObjects(createInitialObjects(selectedObjectIds, params, customMasses, customRadii, customInnerRatios));
      setCurrentTime(0);
      setIsRunning(false);
    }
  };

  // Handle Param Change
  const handleParamChange = (key: keyof SystemParameters, val: number) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    setObjects(createInitialObjects(selectedObjectIds, updated, customMasses, customRadii, customInnerRatios));
    setCurrentTime(0);
    setIsRunning(false);
  };

  // Custom mass/radius/thickness changes
  const handleCustomMassChange = (id: string, m: number) => {
    const updatedMasses = { ...customMasses, [id]: m };
    setCustomMasses(updatedMasses);
    setObjects(createInitialObjects(selectedObjectIds, params, updatedMasses, customRadii, customInnerRatios));
    setCurrentTime(0);
    setIsRunning(false);
  };

  const handleCustomRadiusChange = (id: string, r: number) => {
    const updatedRadii = { ...customRadii, [id]: r };
    setCustomRadii(updatedRadii);
    setObjects(createInitialObjects(selectedObjectIds, params, customMasses, updatedRadii, customInnerRatios));
    setCurrentTime(0);
    setIsRunning(false);
  };

  const handleCustomInnerRatioChange = (id: string, ratio: number) => {
    const updatedRatios = { ...customInnerRatios, [id]: ratio };
    setCustomInnerRatios(updatedRatios);
    setObjects(createInitialObjects(selectedObjectIds, params, customMasses, customRadii, updatedRatios));
    setCurrentTime(0);
    setIsRunning(false);
  };

  // Toggle Play / Pause
  const handleToggleRun = () => {
    if (!isRunning) {
      // Check if all objects already finished, if so reset first
      const allFinished = objects.every((o) => o.finishTime !== null);
      if (allFinished) {
        handleReset();
      }
      if (soundEnabled) audioSynth.playStartChime();
    }
    setIsRunning(!isRunning);
  };

  // Toggle Sound FX
  const handleToggleSound = () => {
    audioSynth.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Main Physics Integration Loop
  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = null;
      return;
    }

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Cap dt to prevent huge jumps on tab switch
      const dt = Math.min(rawDt, 0.05) * params.timeScale;

      // Calculate FPS
      frameCountRef.current++;
      if (timestamp - lastFpsCalcRef.current >= 500) {
        setFps(Math.round((frameCountRef.current * 1000) / (timestamp - lastFpsCalcRef.current)));
        frameCountRef.current = 0;
        lastFpsCalcRef.current = timestamp;
      }

      setObjects((prevObjs) => {
        const { updatedObjects, newFinishCount } = updatePhysicsState(
          prevObjs,
          params,
          dt,
          currentTime + dt
        );

        if (newFinishCount > 0 && soundEnabled) {
          audioSynth.playFinishWhistle();
        }

        // Check if all objects have finished
        const allDone = updatedObjects.every((o) => o.finishTime !== null);
        if (allDone) {
          setIsRunning(false);
        }

        return updatedObjects;
      });

      setCurrentTime((prev) => prev + dt);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, params, currentTime, soundEnabled]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleRun();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'Digit1') {
        handlePresetChange('preset_4_objects');
      } else if (e.code === 'Digit2') {
        handlePresetChange('preset_spheres');
      } else if (e.code === 'Digit3') {
        handlePresetChange('preset_cylinders');
      } else if (e.code === 'Digit4') {
        handlePresetChange('preset_custom');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, objects]);

  const themeCfg = THEME_CONFIGS[theme];
  const isFinished = objects.length > 0 && objects.every((o) => o.finishTime !== null);
  const isAnySlipping = objects.some((o) => o.isSlipping);

  return (
    <div className={`min-h-screen w-full flex flex-col font-['Inter',sans-serif] ${themeCfg.bgClass} transition-colors duration-300`}>
      {/* Top Header Navigation */}
      <HeaderBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeChange={setTheme}
        preset={preset}
        onPresetChange={handlePresetChange}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onReset={handleReset}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Glassmorphic Sidebar Controls */}
        <SidebarControls
          params={params}
          onParamChange={handleParamChange}
          preset={preset}
          onPresetChange={handlePresetChange}
          theme={theme}
          onReset={handleReset}
          selectedObjectIds={selectedObjectIds}
          onToggleObjectSelect={handleToggleObjectSelect}
          onSelectPresetGroup={handleSelectPresetGroup}
          customMasses={customMasses}
          customRadii={customRadii}
          customInnerRatios={customInnerRatios}
          onCustomMassChange={handleCustomMassChange}
          onCustomRadiusChange={handleCustomRadiusChange}
          onCustomInnerRatioChange={handleCustomInnerRatioChange}
        />

        {/* Center / Right Dynamic Content Views */}
        <section className="flex-1 min-w-0 flex flex-col gap-6">
          {currentTab === 'race' && (
            <RaceCanvas
              objects={objects}
              params={params}
              theme={theme}
              currentTime={currentTime}
              isRunning={isRunning}
              onReset={handleReset}
              onStep={() => {
                setIsRunning(false);
                const dt = 0.05 * params.timeScale;
                setObjects((prev) => updatePhysicsState(prev, params, dt, currentTime + dt).updatedObjects);
                setCurrentTime((prev) => prev + dt);
              }}
              onTogglePlay={handleToggleRun}
            />
          )}

          {currentTab === 'energy' && (
            <EnergySplitView objects={objects} params={params} theme={theme} />
          )}

          {currentTab === 'equations' && (
            <EquationsFBDView params={params} theme={theme} />
          )}
        </section>
      </main>

      {/* Bottom Status Bar */}
      <StatusBar
        theme={theme}
        fps={fps}
        isRunning={isRunning}
        isFinished={isFinished}
        isSlipping={isAnySlipping}
        currentTime={currentTime}
      />
    </div>
  );
}

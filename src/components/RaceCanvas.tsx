import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RollingObject, SystemParameters, ThemeMode } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';
import { Trophy, Flag, BookOpen, AlertTriangle, CheckCircle2, ChevronUp, ChevronDown, RotateCcw, Play, Pause, FastForward } from 'lucide-react';

interface RaceCanvasProps {
  objects: RollingObject[];
  params: SystemParameters;
  theme: ThemeMode;
  currentTime: number;
  isRunning: boolean;
  onReset: () => void;
  onStep: () => void;
  onTogglePlay: () => void;
}

function createLaneTextSprite(text: string, color: string = '#0284c7'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 120, 56, 10);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 32);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.4, 0.7, 1.0);
  return sprite;
}

export const RaceCanvas: React.FC<RaceCanvasProps> = ({
  objects,
  params,
  theme,
  currentTime,
  isRunning,
  onReset,
  onStep,
  onTogglePlay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [showVectors, setShowVectors] = useState<boolean>(true);
  
  // Right-side card toggle and collapse controls
  const [showMathCard, setShowMathCard] = useState<boolean>(false);
  const [isMathCollapsed, setIsMathCollapsed] = useState<boolean>(false);
  
  const [showProbeCard, setShowProbeCard] = useState<boolean>(false);
  const [isProbeCollapsed, setIsProbeCollapsed] = useState<boolean>(false);
  
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);

  const themeCfg = THEME_CONFIGS[theme];
  const isDark = theme === 'dark' || theme === 'cyber';

  // Lead object for live telemetry
  const leadObject = objects.length > 0 ? [...objects].sort((a, b) => b.position - a.position)[0] : null;

  // Refs for Three.js engine
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const rampGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js Scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x090d16 : 0xeef5fb);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 14, 24);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go under floor
    controls.minDistance = 5;
    controls.maxDistance = 120;
    controls.target.set(10, 3, 0);
    controls.update();
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.6 : 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.0 : 1.2);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0x1e293b : 0xbae6fd,
      isDark ? 0x020617 : 0xe2e8f0,
      0.5
    );
    scene.add(hemiLight);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0xe2e8f0,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ground Grid Helper
    const gridHelper = new THREE.GridHelper(140, 70, isDark ? 0x00f2fe : 0x0284c7, isDark ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  // Build / Rebuild 3D Incline Ramp Geometry & Smart Camera Auto-Fit
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (rampGroupRef.current) {
      scene.remove(rampGroupRef.current);
    }

    const rampGroup = new THREE.Group();

    const thetaRad = (params.angleDeg * Math.PI) / 180;
    const rampLength3D = 20; // 20 units in 3D scene represents params.trackLength meters
    const height3D = rampLength3D * Math.sin(thetaRad);
    const baseLength3D = rampLength3D * Math.cos(thetaRad);

    const laneWidth = 2.2;
    const numLanes = Math.max(objects.length, 1);
    const totalRampWidth = numLanes * laneWidth + 0.8;

    // 1. Ramp Top Surface (Inclined Plane)
    const rampGeo = new THREE.BoxGeometry(rampLength3D, 0.2, totalRampWidth);
    const rampMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0xdbeafe,
      transparent: true,
      opacity: isDark ? 0.85 : 0.92,
      roughness: 0.2,
      metalness: 0.1,
    });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    rampMesh.castShadow = true;
    rampMesh.receiveShadow = true;

    // Position and Rotate Ramp Mesh
    rampMesh.rotation.z = -thetaRad;
    rampMesh.position.set(baseLength3D / 2, height3D / 2, 0);
    rampGroup.add(rampMesh);

    // 2. Front Wedge Solid Side Face
    const wedgeShape = new THREE.Shape();
    wedgeShape.moveTo(0, 0);
    wedgeShape.lineTo(baseLength3D, 0);
    wedgeShape.lineTo(0, height3D);
    wedgeShape.closePath();

    const extrudeSettings = { depth: totalRampWidth, bevelEnabled: false };
    const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, extrudeSettings);
    const wedgeMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0xfde68a,
      roughness: 0.5,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeMesh.position.set(0, 0, -totalRampWidth / 2);
    wedgeMesh.castShadow = true;
    rampGroup.add(wedgeMesh);

    // 3. Lane Dividers and Lane Numbers (1 to N)
    for (let i = 0; i <= numLanes; i++) {
      const zPos = -totalRampWidth / 2 + 0.4 + i * laneWidth;
      
      // Divider line along incline
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, height3D + 0.11, zPos),
        new THREE.Vector3(baseLength3D, 0.11, zPos),
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: isDark ? 0x00f2fe : 0x0284c7,
        dashSize: 0.5,
        gapSize: 0.3,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      rampGroup.add(line);

      // Add Lane Number Badges for each lane
      if (i < numLanes) {
        const laneZ = -totalRampWidth / 2 + 0.4 + (i + 0.5) * laneWidth;
        const laneObj = objects[i];
        const badgeColor = laneObj ? laneObj.color : '#0284c7';
        const laneSprite = createLaneTextSprite(`Lane ${i + 1}`, badgeColor);
        laneSprite.position.set(-0.6, height3D + 0.8, laneZ);
        rampGroup.add(laneSprite);
      }
    }

    // Green Start Banner at Peak (Left)
    const bannerMatStart = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 });
    const bannerGeoStart = new THREE.BoxGeometry(0.3, 0.6, totalRampWidth + 0.4);
    const bannerStart = new THREE.Mesh(bannerGeoStart, bannerMatStart);
    bannerStart.position.set(0, height3D + 0.3, 0);
    rampGroup.add(bannerStart);

    // Red Finish Banner at Base (Right)
    const bannerMatFinish = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const bannerFinish = new THREE.Mesh(bannerGeoStart, bannerMatFinish);
    bannerFinish.position.set(baseLength3D, 0.3, 0);
    rampGroup.add(bannerFinish);

    scene.add(rampGroup);
    rampGroupRef.current = rampGroup;

    // SMART CAMERA AUTO-FIT ENGINE: Adjust dolly/zoom distance based on N lanes
    if (cameraRef.current && controlsRef.current) {
      const cameraDistance = 24 + (numLanes - 1) * 2.8;
      cameraRef.current.position.set(
        18 + (numLanes - 1) * 0.7,
        14 + (numLanes - 1) * 0.9,
        cameraDistance
      );
      controlsRef.current.target.set(baseLength3D / 2, height3D / 2, 0);
      controlsRef.current.update();
    }
  }, [params.angleDeg, params.trackLength, objects.length, theme]);

  // Build / Update 3D Rolling Objects inside scene with ZERO clipping
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const thetaRad = (params.angleDeg * Math.PI) / 180;
    const rampLength3D = 20;
    const height3D = rampLength3D * Math.sin(thetaRad);

    const laneWidth = 2.2;
    const numLanes = objects.length;
    const totalRampWidth = numLanes * laneWidth + 0.8;

    // Direction vector down incline: u_down = (cos theta, -sin theta, 0)
    const uDownX = Math.cos(thetaRad);
    const uDownY = -Math.sin(thetaRad);

    // Normal vector perpendicular to incline (pointing UP): N = (sin theta, cos theta, 0)
    const uNormX = Math.sin(thetaRad);
    const uNormY = Math.cos(thetaRad);

    // Remove meshes for objects no longer selected
    const currentObjectIds = new Set(objects.map((o) => o.id));
    meshesRef.current.forEach((group, id) => {
      if (!currentObjectIds.has(id)) {
        scene.remove(group);
        meshesRef.current.delete(id);
      }
    });

    objects.forEach((obj, index) => {
      let group = meshesRef.current.get(obj.id);

      const R3D = 0.7 * (obj.radius / 0.3); // Scaled 3D radius according to real object radius!
      const innerRatio = obj.innerRadiusRatio || 0.65;
      const meshKey = `${obj.type}_${obj.color}_${R3D.toFixed(3)}_${innerRatio.toFixed(3)}`;

      // Create or Rebuild object mesh group if missing or if geometry params changed
      if (!group || group.userData.key !== meshKey) {
        if (!group) {
          group = new THREE.Group();
          meshesRef.current.set(obj.id, group);
        } else {
          // Clear old child meshes for rebuild
          while (group.children.length > 0) {
            const child = group.children[0];
            group.remove(child);
            if ('geometry' in child && (child as any).geometry) (child as any).geometry.dispose();
          }
        }

        group.userData.key = meshKey;

        let coreMesh: THREE.Object3D;
        const mainColor = new THREE.Color(obj.color);

        if (obj.type === 'solid_sphere') {
          const sphereGeo = new THREE.SphereGeometry(R3D, 32, 32);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.3,
            metalness: 0.2,
          });
          coreMesh = new THREE.Mesh(sphereGeo, sphereMat);
          coreMesh.castShadow = true;

          // Stripe marking for visible spin
          const stripeGeo = new THREE.TorusGeometry(R3D * 1.01, Math.max(R3D * 0.05, 0.02), 16, 32);
          const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          coreMesh.add(new THREE.Mesh(stripeGeo, stripeMat));
        } else if (obj.type === 'hollow_sphere' || obj.type === 'custom_sphere') {
          const sphereGeo = new THREE.SphereGeometry(R3D, 32, 32);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.3,
            transparent: true,
            opacity: 0.85,
          });
          coreMesh = new THREE.Mesh(sphereGeo, sphereMat);
          coreMesh.castShadow = true;

          const innerR = R3D * innerRatio;
          if (innerR > 0.01) {
            const innerGeo = new THREE.SphereGeometry(innerR, 24, 24);
            const innerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
            coreMesh.add(new THREE.Mesh(innerGeo, innerMat));
          }

          const stripeGeo = new THREE.TorusGeometry(R3D * 1.01, Math.max(R3D * 0.05, 0.02), 16, 32);
          const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          coreMesh.add(new THREE.Mesh(stripeGeo, stripeMat));
        } else if (obj.type === 'solid_cylinder') {
          const cylLen = obj.id === 'solid_disc' ? 0.3 : 0.8;
          const cylGeo = new THREE.CylinderGeometry(R3D, R3D, cylLen, 32);
          const cylMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.3,
            metalness: 0.3,
          });
          coreMesh = new THREE.Mesh(cylGeo, cylMat);
          coreMesh.rotation.x = Math.PI / 2; // Orient cylinder to roll on edge
          coreMesh.castShadow = true;

          const spokeGeo = new THREE.BoxGeometry(R3D * 1.8, Math.max(R3D * 0.05, 0.02), cylLen + 0.02);
          const spokeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          coreMesh.add(new THREE.Mesh(spokeGeo, spokeMat));
        } else if (obj.type === 'ring') {
          const tubeR = Math.max(R3D * 0.18, 0.06);
          const ringR = Math.max(R3D - tubeR, 0.1);
          const torusGeo = new THREE.TorusGeometry(ringR, tubeR, 16, 32);
          const torusMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.2,
            metalness: 0.6,
          });
          coreMesh = new THREE.Mesh(torusGeo, torusMat);
          coreMesh.castShadow = true;

          const spokeGeo = new THREE.BoxGeometry(R3D * 1.6, tubeR * 0.5, tubeR * 0.5);
          const spokeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          coreMesh.add(new THREE.Mesh(spokeGeo, spokeMat));
        } else {
          // Hollow / Custom Cylinder (Pipe)
          const outerR = R3D;
          const innerR = Math.min(R3D * innerRatio, R3D * 0.95);
          
          const tubeShape = new THREE.Shape();
          tubeShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
          if (innerR > 0.01) {
            const holePath = new THREE.Path();
            holePath.absarc(0, 0, innerR, 0, Math.PI * 2, true);
            tubeShape.holes.push(holePath);
          }

          const extrudeSettings = { depth: 0.8, bevelEnabled: false, curveSegments: 32 };
          const pipeGeo = new THREE.ExtrudeGeometry(tubeShape, extrudeSettings);
          const pipeMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.3,
            metalness: 0.4,
            side: THREE.DoubleSide,
          });
          coreMesh = new THREE.Mesh(pipeGeo, pipeMat);
          coreMesh.position.z = -0.4;
          coreMesh.castShadow = true;
        }

        group.add(coreMesh);
      }

      // Ensure mesh group is attached to active scene
      if (!scene.children.includes(group)) {
        scene.add(group);
      }

      // CALCULATE 3D POSITION WITH ZERO CLIPPING OFFSET!
      const progressFrac = Math.min(obj.position / params.trackLength, 1.0);
      const dist3D = progressFrac * rampLength3D;

      // Contact point on top ramp surface (0.1 shift accounts for top half of 0.2 thick ramp box)
      const contactX = dist3D * uDownX + 0.1 * uNormX;
      const contactY = height3D + dist3D * uDownY + 0.1 * uNormY;
      const laneZ = -totalRampWidth / 2 + 0.4 + (index + 0.5) * laneWidth;

      // Shift center perpendicular to ramp surface by exactly R3D along Normal vector (uNormX, uNormY)!
      const centerX = contactX + R3D * uNormX;
      const centerY = contactY + R3D * uNormY;

      group.position.set(centerX, centerY, laneZ);

      // Rotate object around its rolling axis according to physics rotationAngle
      group.rotation.z = -obj.rotationAngle;
    });
  }, [objects, params.trackLength, params.angleDeg]);

  // Leaderboard ranking
  const sortedByRank = [...objects].sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return b.position - a.position;
  });

  const isAnySlipping = objects.some((o) => o.isSlipping);

  // Live Math metrics for lead object & substitution
  const thetaRad = (params.angleDeg * Math.PI) / 180;
  const sinT = Math.sin(thetaRad);
  const betaLead = leadObject?.beta || 0.4;
  const mLead = params.mass;
  const rLead = params.radius;
  const kLead = Math.sqrt(betaLead) * rLead;
  const iLead = mLead * kLead * kLead;
  const aLead = (9.81 * sinT) / (1 + betaLead);
  const vLead = leadObject?.velocity || 0;
  
  const distS = leadObject?.position || 0;
  const vAtS = Math.sqrt((2 * 9.81 * distS * sinT) / (1 + betaLead));
  const heightH = params.trackLength * sinT;
  const vAtBottom = Math.sqrt((2 * 9.81 * heightH) / (1 + betaLead));

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* SIMULATION ACTION BAR (LIGHT THEME MATCHING PICTURE 4) */}
      <div className="bg-[#eef5fb] dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-2 font-['Space_Grotesk']">
          <span className="font-extrabold text-[#0f172a] dark:text-slate-100 uppercase tracking-wider text-xs">
            RACE CONTROL ({objects.length} Objects)
          </span>
          <button onClick={onReset} className="text-[#0284c7] dark:text-cyan-400 font-mono hover:underline text-[11px] flex items-center gap-1 font-bold">
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>
        </div>

        {/* Action Controls + TOP HEADER TOGGLE BUTTONS FOR UNOBSTRUCTED VIEW */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-1.5 rounded-lg font-bold text-white font-['Space_Grotesk'] shadow-sm transition-all flex items-center gap-1.5 ${
              isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[#0284c7] hover:bg-[#0369a1]'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pause Race' : 'Start Race'}
          </button>

          <button
            onClick={onStep}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#0284c7] dark:border-cyan-500 font-bold text-[#0284c7] dark:text-cyan-400 hover:bg-sky-50 flex items-center gap-1"
          >
            <FastForward className="w-3.5 h-3.5" /> Step
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            Reset
          </button>

          {/* TOP HEADER TOGGLES FOR PANELS */}
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={() => {
              setShowMathCard(!showMathCard);
              if (!showMathCard) setIsMathCollapsed(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all border ${
              showMathCard
                ? 'bg-sky-100 text-[#0284c7] border-[#0284c7] dark:bg-cyan-950 dark:text-cyan-300'
                : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            [ {showMathCard ? 'Hide Math' : 'Toggle Math'} ]
          </button>

          <button
            onClick={() => {
              setShowProbeCard(!showProbeCard);
              if (!showProbeCard) setIsProbeCollapsed(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all border ${
              showProbeCard
                ? 'bg-emerald-100 text-emerald-900 border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            [ {showProbeCard ? 'Hide Probe' : 'Toggle Probe'} ]
          </button>

          <label className="flex items-center gap-1.5 font-mono font-bold text-[#0f172a] dark:text-slate-300 ml-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isSlowMo}
              onChange={(e) => setIsSlowMo(e.target.checked)}
              className="accent-[#0284c7]"
            />
            0.25x Slow-Mo
          </label>
        </div>

        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 hidden lg:block font-bold">
          3D Camera: <span className="text-[#0284c7] dark:text-cyan-400 font-extrabold">Orbit Active (Click & Drag 360°)</span>
        </div>
      </div>

      {/* THREE.JS CANVAS CONTAINER */}
      <div ref={containerRef} className="relative w-full h-[540px] md:h-[620px] rounded-xl overflow-hidden border border-sky-300 dark:border-cyan-500/30 shadow-md bg-[#eef5fb] dark:bg-slate-950">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Left Canvas Controls Toolbar */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-sky-300 dark:border-cyan-500/40 flex flex-wrap items-center gap-2.5 text-xs font-mono shadow-md z-10">
          <div className="flex items-center gap-1.5 text-[#0284c7] dark:text-cyan-400 font-extrabold font-['Space_Grotesk']">
            <Flag className="w-4 h-4" />
            TIMER:
          </div>
          <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{currentTime.toFixed(2)}s</span>

          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2.5 py-1 rounded text-[11px] font-black border transition-colors ${
              showVectors
                ? 'bg-[#0284c7] text-white border-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
            }`}
          >
            {showVectors ? 'Vectors: ON' : 'Vectors: OFF'}
          </button>
        </div>

        {/* Top Right Small Pure Rolling Status Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {isAnySlipping ? (
            <div className="bg-amber-100/95 dark:bg-amber-950/90 border border-amber-500 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-mono font-black shadow-md flex items-center gap-1.5 backdrop-blur-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>SLIPPING DETECTED</span>
            </div>
          ) : (
            <div className="bg-emerald-100/95 dark:bg-emerald-950/90 border border-emerald-500 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-mono font-black shadow-md flex items-center gap-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>PURE ROLLING ASSURED</span>
            </div>
          )}
        </div>



        {/* TOP-RIGHT FLOATING CARD: TEXTBOOK MATH FORMULATION CARD */}
        {showMathCard && (
          <div className="absolute top-3 right-3 w-80 md:w-[440px] bg-white dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border-2 border-slate-300 dark:border-cyan-500 shadow-xl text-[#0f172a] dark:text-slate-100 z-10 transition-all font-sans">
            {/* Header with Collapse/Expand [ - ] / [ + ] Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#0284c7] dark:text-cyan-400 uppercase tracking-wider font-['Space_Grotesk']">
                <BookOpen className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400" />
                MOMENT OF INERTIA & DYNAMICS DERIVATION
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMathCollapsed(!isMathCollapsed)}
                  title={isMathCollapsed ? "Expand panel" : "Collapse panel"}
                  className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-sky-100 text-[#0284c7] dark:bg-cyan-950 dark:text-cyan-300 border border-sky-300 dark:border-cyan-800 hover:bg-sky-200 rounded transition-colors"
                >
                  {isMathCollapsed ? '[ + ]' : '[ - ]'}
                </button>
                <button
                  onClick={() => setShowMathCard(false)}
                  title="Close panel"
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Collapsed View */}
            {isMathCollapsed ? (
              <div
                onClick={() => setIsMathCollapsed(false)}
                className="cursor-pointer text-xs font-mono text-[#0284c7] dark:text-cyan-300 flex items-center justify-between py-1 px-2 rounded bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-cyan-700"
              >
                <span>📐 Derivation Summary (k = {(kLead).toFixed(3)}m)</span>
                <span className="font-bold text-[#0284c7] dark:text-cyan-400">[ + Expand ]</span>
              </div>
            ) : (
              /* Expanded Textbook Style Page */
              <div className="flex flex-col gap-2 text-[11px] leading-snug max-h-[440px] overflow-y-auto pr-1">
                {/* Header info badge for leader */}
                <div className="flex items-center justify-between text-[10px] bg-sky-50 dark:bg-slate-800 py-1 px-2 rounded-md border border-sky-200 dark:border-slate-700 text-[#0f172a] dark:text-slate-200 font-mono">
                  <span>Leader: <strong className="text-[#0284c7] dark:text-cyan-400 font-extrabold">{leadObject?.name || 'Solid Sphere'}</strong></span>
                  <span className="font-bold">I/mR²={betaLead.toFixed(2)} | m={mLead.toFixed(1)}kg | R={rLead.toFixed(2)}m</span>
                </div>

                {/* Section 1: Moment of Inertia & Gyration Radius */}
                <div className="p-2 rounded-lg bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-[#0284c7] dark:text-cyan-400 font-['Space_Grotesk'] font-extrabold uppercase">
                    1. Moment of Inertia (I) & Gyration Radius (k):
                  </div>
                  <div className="text-[#0f172a] dark:text-slate-100 font-bold text-[11px] mt-0.5 font-mono">
                    I = m·k² = (I/mR²)·m·R² <span className="text-slate-500 text-[10px] font-normal">(k = √(I/m))</span>
                  </div>
                  {/* Live Substitution */}
                  <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">
                    ⇒ k = √({betaLead.toFixed(2)}) × {rLead.toFixed(2)}m = <span className="text-[#0284c7] dark:text-cyan-400 font-black">{kLead.toFixed(3)} m</span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    ⇒ I = {mLead.toFixed(1)}kg × ({kLead.toFixed(3)}m)² = <span className="px-1 py-0.2 rounded bg-sky-100 text-[#0284c7] dark:bg-cyan-950 dark:text-cyan-300 font-black">{iLead.toFixed(4)} kg·m²</span>
                  </div>
                </div>

                {/* Section 2: Linear Acceleration down incline */}
                <div className="p-2 rounded-lg bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-[#0284c7] dark:text-cyan-400 font-['Space_Grotesk'] font-extrabold uppercase">
                    2. Linear Acceleration down Incline (a):
                  </div>
                  <div className="font-bold text-[#0f172a] dark:text-slate-100 text-[11px] mt-0.5 font-mono">
                    a = (g · sin θ) / (1 + I/mR²)
                  </div>
                  {/* Live Substitution */}
                  <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">
                    ⇒ a = (9.81 × sin {params.angleDeg}°) / (1 + {betaLead.toFixed(2)}) = <span className="px-1 py-0.2 rounded bg-sky-100 text-[#0284c7] dark:bg-cyan-950 dark:text-cyan-300 font-black">{aLead.toFixed(2)} m/s²</span>
                  </div>
                </div>

                {/* Section 3: Instantaneous Velocity at distance s */}
                <div className="p-2 rounded-lg bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-[#0284c7] dark:text-cyan-400 font-['Space_Grotesk'] font-extrabold uppercase">
                    3. Instantaneous Velocity at distance s (v):
                  </div>
                  <div className="font-bold text-[#0f172a] dark:text-slate-100 text-[11px] mt-0.5 font-mono">
                    v(s) = √(2 · g · s · sin θ / (1 + I/mR²))
                  </div>
                  {/* Live Substitution */}
                  <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">
                    ⇒ v({distS.toFixed(1)}m) = √[(19.62 × {distS.toFixed(1)} × sin {params.angleDeg}°) / (1 + {betaLead.toFixed(2)})] = <span className="px-1 py-0.2 rounded bg-sky-100 text-[#0284c7] dark:bg-cyan-950 dark:text-cyan-300 font-black">{vAtS.toFixed(2)} m/s</span>
                  </div>
                </div>

                {/* Section 4: Final Bottom Speed */}
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-cyan-950/60 border border-[#0284c7] dark:border-cyan-500 flex items-center justify-between gap-2 shadow-xs">
                  <div>
                    <div className="text-[10px] text-[#0284c7] dark:text-cyan-400 font-['Space_Grotesk'] font-extrabold uppercase">
                      4. Final Bottom Speed (h = {heightH.toFixed(1)}m):
                    </div>
                    <div className="font-bold text-[#0f172a] dark:text-slate-100 text-[11px] mt-0.5 font-mono">
                      v_bottom = √(2 · g · h / (1 + I/mR²))
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#0284c7] text-white font-black rounded-lg text-xs shadow-sm shrink-0 font-mono">
                    {vAtBottom.toFixed(2)} m/s
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM-RIGHT FLOATING CARD: LIVE TELEMETRY STATE PROBE */}
        {showProbeCard && (
          <div className="absolute bottom-3 right-3 w-80 md:w-[420px] bg-white dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-slate-300 dark:border-cyan-500 shadow-xl font-['Space_Grotesk'] text-[#0f172a] dark:text-slate-100 z-10 transition-all">
            {/* Header with Collapse/Expand [ - ] / [ + ] Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
              <span className="text-xs font-black text-[#0284c7] dark:text-cyan-400 uppercase tracking-wider">
                Live Telemetry Probe ({leadObject?.shortName || 'Leader'})
              </span>
              <div className="flex items-center gap-1.5">
                <span className="bg-sky-100 text-[#0284c7] border border-sky-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
                  t = {currentTime.toFixed(2)} s
                </span>
                <button
                  onClick={() => setIsProbeCollapsed(!isProbeCollapsed)}
                  title={isProbeCollapsed ? "Expand panel" : "Collapse panel"}
                  className="px-2 py-0.5 text-xs font-mono font-bold bg-sky-100 text-[#0284c7] dark:bg-cyan-950 dark:text-cyan-300 border border-sky-300 dark:border-cyan-800 hover:bg-sky-200 rounded transition-colors ml-1"
                >
                  {isProbeCollapsed ? '[ + ]' : '[ - ]'}
                </button>
                <button
                  onClick={() => setShowProbeCard(false)}
                  title="Close panel"
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Collapsed View */}
            {isProbeCollapsed ? (
              <div
                onClick={() => setIsProbeCollapsed(false)}
                className="cursor-pointer text-xs font-mono text-[#0284c7] dark:text-cyan-300 flex items-center justify-between py-1 px-2 rounded bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-cyan-800"
              >
                <span>📊 s={(leadObject?.position || 0).toFixed(1)}m | v={vLead.toFixed(1)}m/s | a={aLead.toFixed(1)}m/s²</span>
                <span className="font-bold text-[#0284c7] dark:text-cyan-400">[ + Expand ]</span>
              </div>
            ) : (
              /* Expanded Telemetry Grid */
              <div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2 bg-[#f8fafc] dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold">Displacement (s)</div>
                    <div className="font-black text-[#0f172a] dark:text-slate-100 text-sm mt-0.5">
                      {(leadObject?.position || 0).toFixed(2)} m
                    </div>
                  </div>

                  <div className="p-2 bg-[#f8fafc] dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold">Velocity (v)</div>
                    <div className="font-black text-[#0284c7] dark:text-cyan-400 text-sm mt-0.5">
                      {vLead.toFixed(2)} m/s
                    </div>
                  </div>

                  <div className="p-2 bg-[#f8fafc] dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold">Acceleration (a)</div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                      {aLead.toFixed(2)} m/s²
                    </div>
                  </div>

                  <div className="p-2 bg-[#f8fafc] dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold">Kinetic Energy</div>
                    <div className="font-black text-purple-600 dark:text-purple-400 text-sm mt-0.5">
                      {((leadObject?.keTrans || 0) + (leadObject?.keRot || 0)).toFixed(1)} J
                    </div>
                  </div>
                </div>

                {/* LEADERBOARD COMPACT STRIP */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-[#0284c7] dark:text-cyan-400">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> Leader: {sortedByRank[0]?.shortName || 'Solid Sph.'}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold">
                    β = {(sortedByRank[0]?.beta || 0.4).toFixed(2)} (k = {(sortedByRank[0]?.kRadius || 0).toFixed(2)}m)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export type ThemeMode = 'bright' | 'dark' | 'cyber';

export type TabMode = 'race' | 'energy' | 'equations';

export type CanvasViewMode = '3d';

export type PresetMode = 'preset_all_in_one' | 'preset_4_objects' | 'preset_spheres' | 'preset_cylinders' | 'preset_custom' | 'custom_selection';

export type ObjectType = 
  | 'solid_sphere' 
  | 'hollow_sphere' 
  | 'solid_cylinder' 
  | 'hollow_cylinder' 
  | 'ring' 
  | 'custom_cylinder' 
  | 'custom_sphere';

export interface ObjectSpec {
  id: string;
  name: string;
  shortName: string;
  type: ObjectType;
  beta: number; // Moment of Inertia factor I / (m R^2)
  formulaText: string;
  color: string;
  accentColor: string;
  category: 'sphere' | 'cylinder' | 'custom';
  defaultInnerRatio?: number;
}

export interface RollingObject {
  id: string;
  name: string;
  shortName: string;
  type: ObjectType;
  beta: number; // Moment of Inertia ratio I / (m R^2)
  kRadius: number; // Radius of gyration k = sqrt(I / m)
  formulaText: string;
  color: string;
  accentColor: string;
  mass: number; // kg
  radius: number; // m (R_out)
  innerRadiusRatio?: number; // R_in / R_out (wall thickness ratio)
  
  // Dynamic race metrics
  position: number; // meters down incline (0 to L)
  velocity: number; // m/s
  angularVelocity: number; // rad/s
  acceleration: number; // m/s^2
  angularAcceleration: number; // rad/s^2
  rotationAngle: number; // radians
  isSlipping: boolean;
  requiredFriction: number; // mu_req
  finishTime: number | null; // seconds
  rank: number | null;
  
  // Energy breakdown at current state
  pe: number; // Joules
  keTrans: number; // Joules
  keRot: number; // Joules
  totalEnergy: number; // Joules
}

export interface SystemParameters {
  angleDeg: number; // 5 to 60, default 20
  trackLength: number; // 10 to 100, default 30
  mass: number; // 0.5 to 10, default 2
  radius: number; // 0.1 to 1.0, default 0.3
  staticFriction: number; // 0.00 to 1.00, default 0.40
  kineticFriction: number; // 0.00 to 0.80, default 0.30
  gravity: number; // 9.81 m/s^2
  timeScale: number; // 0.2, 0.5, 1.0, 2.0
  customCylinderInnerRatio: number; // R_in / R_out (0.0 to 0.95)
  customSphereInnerRatio: number; // R_in / R_out (0.0 to 0.95)
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  beta: number;
  time: number;
  finalSpeed: number;
  color: string;
}




import { RollingObject, SystemParameters, ObjectType, ObjectSpec } from '../types';

export const ALL_10_OBJECT_SPECS: ObjectSpec[] = [
  {
    id: 'solid_sphere',
    name: 'Solid Sphere (k² = 0.40 R²)',
    shortName: 'Solid Sph.',
    type: 'solid_sphere',
    beta: 0.40,
    formulaText: 'I = 0.40 mR² (k = 0.63R)',
    color: '#10b981', // Emerald
    accentColor: '#34d399',
    category: 'sphere',
  },
  {
    id: 'hollow_sphere',
    name: 'Hollow Sphere / Thin Shell (k² = 0.67 R²)',
    shortName: 'Holl. Sph.',
    type: 'hollow_sphere',
    beta: 2 / 3,
    formulaText: 'I = 0.67 mR² (k = 0.82R)',
    color: '#f59e0b', // Amber
    accentColor: '#fbbf24',
    category: 'sphere',
  },
  {
    id: 'solid_disc',
    name: 'Solid Disc (k² = 0.50 R²)',
    shortName: 'Solid Disc',
    type: 'solid_cylinder',
    beta: 0.50,
    formulaText: 'I = 0.50 mR² (k = 0.71R)',
    color: '#06b6d4', // Cyan
    accentColor: '#22d3ee',
    category: 'cylinder',
  },
  {
    id: 'solid_cylinder',
    name: 'Solid Cylinder (k² = 0.50 R²)',
    shortName: 'Solid Cyl.',
    type: 'solid_cylinder',
    beta: 0.50,
    formulaText: 'I = 0.50 mR² (k = 0.71R)',
    color: '#3b82f6', // Blue
    accentColor: '#60a5fa',
    category: 'cylinder',
  },
  {
    id: 'hollow_cylinder',
    name: 'Hollow Cylinder / Pipe (k² = 0.85 R²)',
    shortName: 'Holl. Pipe',
    type: 'hollow_cylinder',
    beta: 0.85,
    formulaText: 'I = 0.85 mR² (k = 0.92R)',
    color: '#a855f7', // Purple
    accentColor: '#c084fc',
    category: 'cylinder',
    defaultInnerRatio: 0.83,
  },
  {
    id: 'ring',
    name: 'Thin Ring / Hoop (k² = 1.00 R²)',
    shortName: 'Thin Ring',
    type: 'ring',
    beta: 1.00,
    formulaText: 'I = 1.00 mR² (k = 1.00R)',
    color: '#ec4899', // Pink
    accentColor: '#f472b6',
    category: 'cylinder',
  },
];

export function calculateBetaAndK(type: ObjectType, radius: number, innerRatio: number = 0.6): { beta: number; kRadius: number; formulaText: string } {
  const x = Math.min(Math.max(innerRatio, 0.0), 0.98);
  let beta = 0.4;
  let formulaText = 'I = 0.40 mR²';

  switch (type) {
    case 'solid_sphere':
      if (x > 0.02) {
        const top = 1 - Math.pow(x, 5);
        const bot = 1 - Math.pow(x, 3);
        beta = bot > 0 ? 0.4 * (top / bot) : 0.4;
        formulaText = `I = 0.4mR²(1-x⁵)/(1-x³) [x=${x.toFixed(2)}]`;
      } else {
        beta = 0.4;
        formulaText = 'I = 0.40 mR²';
      }
      break;
    case 'solid_cylinder':
      if (x > 0.02) {
        beta = 0.5 * (1 + x * x);
        formulaText = `I = ½mR²(1+${(x*x).toFixed(2)})`;
      } else {
        beta = 0.5;
        formulaText = 'I = 0.50 mR²';
      }
      break;
    case 'hollow_sphere':
      beta = 2 / 3;
      formulaText = 'I = 0.67 mR²';
      break;
    case 'hollow_cylinder':
      beta = 0.5 * (1 + x * x);
      formulaText = `I = ½mR²(1+${(x*x).toFixed(2)})`;
      break;
    case 'ring':
      beta = 1.0;
      formulaText = 'I = 1.00 mR²';
      break;
    case 'custom_cylinder':
      beta = 0.5 * (1 + x * x);
      formulaText = `I = ½mR²(1+${(x*x).toFixed(2)})`;
      break;
    case 'custom_sphere':
      const top = 1 - Math.pow(x, 5);
      const bot = 1 - Math.pow(x, 3);
      beta = bot > 0 ? 0.4 * (top / bot) : 0.4;
      formulaText = `I = 0.4mR²(1-x⁵)/(1-x³) [x=${x.toFixed(2)}]`;
      break;
  }

  const kRadius = Math.sqrt(beta) * radius;
  return { beta, kRadius, formulaText };
}

export function createInitialObjects(
  presetOrSelectedIds: string | string[],
  params: SystemParameters,
  customMasses?: Record<string, number>,
  customRadii?: Record<string, number>,
  customInnerRatios?: Record<string, number>
): RollingObject[] {
  let selectedIds: string[] = [];

  if (Array.isArray(presetOrSelectedIds)) {
    selectedIds = presetOrSelectedIds;
  } else if (presetOrSelectedIds === 'preset_all_in_one') {
    selectedIds = ['solid_sphere', 'hollow_sphere', 'solid_disc', 'solid_cylinder', 'hollow_cylinder', 'ring'];
  } else if (presetOrSelectedIds === 'preset_spheres') {
    selectedIds = ['solid_sphere', 'hollow_sphere'];
  } else if (presetOrSelectedIds === 'preset_cylinders') {
    selectedIds = ['solid_disc', 'solid_cylinder', 'hollow_cylinder', 'ring'];
  } else {
    // Default standard selection
    selectedIds = ['solid_sphere', 'solid_disc', 'solid_cylinder', 'hollow_sphere', 'ring'];
  }


  const selectedSpecs = ALL_10_OBJECT_SPECS.filter((s) => selectedIds.includes(s.id));

  return selectedSpecs.map((spec) => {
    const m = customMasses && customMasses[spec.id] !== undefined ? customMasses[spec.id] : params.mass;
    const r = customRadii && customRadii[spec.id] !== undefined ? customRadii[spec.id] : params.radius;
    
    let innerRatio = customInnerRatios && customInnerRatios[spec.id] !== undefined
      ? customInnerRatios[spec.id]
      : spec.type === 'custom_cylinder' 
      ? params.customCylinderInnerRatio 
      : spec.type === 'custom_sphere' 
      ? params.customSphereInnerRatio 
      : spec.defaultInnerRatio !== undefined ? spec.defaultInnerRatio : 0.0;

    const { beta, kRadius, formulaText } = calculateBetaAndK(spec.type, r, innerRatio);
    const initialMetrics = calculateAccelerations(beta, m, r, params);

    return {
      id: spec.id,
      name: spec.name,
      shortName: spec.shortName,
      type: spec.type,
      beta,
      kRadius,
      formulaText,
      color: spec.color,
      accentColor: spec.accentColor,
      mass: m,
      radius: r,
      innerRadiusRatio: innerRatio,
      position: 0,
      velocity: 0,
      angularVelocity: 0,
      acceleration: initialMetrics.a,
      angularAcceleration: initialMetrics.alpha,
      rotationAngle: 0,
      isSlipping: initialMetrics.isSlipping,
      requiredFriction: initialMetrics.muReq,
      finishTime: null,
      rank: null,
      pe: m * params.gravity * (params.trackLength * Math.sin((params.angleDeg * Math.PI) / 180)),
      keTrans: 0,
      keRot: 0,
      totalEnergy: m * params.gravity * (params.trackLength * Math.sin((params.angleDeg * Math.PI) / 180)),
    };
  });
}


export function calculateAccelerations(
  beta: number,
  mass: number,
  radius: number,
  params: SystemParameters
) {
  const theta = (params.angleDeg * Math.PI) / 180;
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const g = params.gravity;

  const muReq = (beta / (1 + beta)) * Math.tan(theta);
  const isSlipping = params.staticFriction < muReq;

  let a: number;
  let alpha: number;

  if (!isSlipping) {
    a = (g * sinT) / (1 + beta);
    alpha = a / radius;
  } else {
    a = g * (sinT - params.kineticFriction * cosT);
    if (a < 0) a = 0;
    alpha = (params.kineticFriction * g * cosT) / (beta * radius);
  }

  return { a, alpha, isSlipping, muReq };
}

export function updatePhysicsState(
  objects: RollingObject[],
  params: SystemParameters,
  dt: number,
  currentTime: number
): { updatedObjects: RollingObject[]; newFinishCount: number } {
  const theta = (params.angleDeg * Math.PI) / 180;
  const hTotal = params.trackLength * Math.sin(theta);
  let newFinishCount = 0;

  const finishedRanks = objects.filter((o) => o.rank !== null).map((o) => o.rank as number);
  let nextRank = finishedRanks.length > 0 ? Math.max(...finishedRanks) + 1 : 1;

  const updatedObjects = objects.map((obj) => {
    if (obj.finishTime !== null) {
      return obj;
    }

    const { a, alpha, isSlipping } = calculateAccelerations(obj.beta, obj.mass, obj.radius, params);

    let newVelocity = obj.velocity + a * dt;
    let newPosition = obj.position + obj.velocity * dt + 0.5 * a * dt * dt;

    let newAngVel = obj.angularVelocity + alpha * dt;
    const rotInc = !isSlipping ? (obj.velocity * dt + 0.5 * a * dt * dt) / obj.radius : obj.angularVelocity * dt;
    let newRotationAngle = obj.rotationAngle + rotInc;

    let finishTime = obj.finishTime;
    let rank = obj.rank;

    if (newPosition >= params.trackLength) {
      newPosition = params.trackLength;
      finishTime = currentTime;
      rank = nextRank;
      nextRank++;
      newFinishCount++;
    }

    const currentHeight = Math.max(0, (params.trackLength - newPosition) * Math.sin(theta));
    const pe = obj.mass * params.gravity * currentHeight;
    const keTrans = 0.5 * obj.mass * newVelocity * newVelocity;

    const I = obj.beta * obj.mass * obj.radius * obj.radius;
    const keRot = 0.5 * I * newAngVel * newAngVel;

    const totalEnergy = obj.mass * params.gravity * hTotal;

    return {
      ...obj,
      position: newPosition,
      velocity: newVelocity,
      angularVelocity: newAngVel,
      acceleration: a,
      angularAcceleration: alpha,
      rotationAngle: newRotationAngle,
      isSlipping,
      finishTime,
      rank,
      pe,
      keTrans,
      keRot,
      totalEnergy,
    };
  });

  return { updatedObjects, newFinishCount };
}

export function getTheoreticalFinishTime(beta: number, trackLength: number, angleDeg: number, g = 9.81): number {
  const theta = (angleDeg * Math.PI) / 180;
  const a = (g * Math.sin(theta)) / (1 + beta);
  return Math.sqrt((2 * trackLength) / a);
}


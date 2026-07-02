// Manejo de archivos handling.meta para FiveM

export interface HandlingValues {
  fMass: number;
  fInitialDragCoeff: number;
  fBrakeForce: number;
  fBrakeBiasFront: number;
  fHandBrakeForce: number;
  fSteeringLock: number;
  fTractionCurveMax: number;
  fTractionCurveMin: number;
  fTractionBiasFront: number;
  fDriveInertia: number;
  nInitialDriveGears: number;
  fInitialDriveForce: number;
  fInitialDriveMaxFlatVel: number;
  fSuspensionForce: number;
  fSuspensionCompDamp: number;
  fSuspensionReboundDamp: number;
  fSuspensionUpperLimit: number;
  fSuspensionLowerLimit: number;
  fSuspensionRaise: number;
  fSuspensionBiasFront: number;
  fAntiRollBarForce: number;
  fAntiRollBarBiasFront: number;
  fCollisionDamageMult: number;
  fWeaponDamageMult: number;
  fDeformationDamageMult: number;
  fEngineDamageMult: number;
  fDriveBiasFront: number;
  fLowSpeedTractionLossMult: number;
  fTractionLossMult: number;
}

function fmt(n: number, decimals = 6): string {
  return n.toFixed(decimals);
}

export function generateHandlingMeta(handlingName: string, v: HandlingValues): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<CHandlingDataMgr>
  <HandlingData>
    <Item type="CHandlingData">
      <handlingName>${handlingName}</handlingName>
      <fMass value="${fmt(v.fMass)}" />
      <fInitialDragCoeff value="${fmt(v.fInitialDragCoeff)}" />
      <fPercentSubmerged value="85.000000" />
      <vecCentreOfMassOffset x="0.000000" y="0.000000" z="0.000000" />
      <vecInertiaMultiplier x="1.000000" y="1.800000" z="1.800000" />
      <fDriveBiasFront value="${fmt(v.fDriveBiasFront)}" />
      <nInitialDriveGears value="${v.nInitialDriveGears}" />
      <fInitialDriveForce value="${fmt(v.fInitialDriveForce)}" />
      <fDriveInertia value="${fmt(v.fDriveInertia)}" />
      <fClutchChangeRateScaleUpShift value="2.000000" />
      <fClutchChangeRateScaleDownShift value="2.000000" />
      <fInitialDriveMaxFlatVel value="${fmt(v.fInitialDriveMaxFlatVel)}" />
      <fBrakeForce value="${fmt(v.fBrakeForce)}" />
      <fBrakeBiasFront value="${fmt(v.fBrakeBiasFront)}" />
      <fHandBrakeForce value="${fmt(v.fHandBrakeForce)}" />
      <fSteeringLock value="${fmt(v.fSteeringLock)}" />
      <fTractionCurveMax value="${fmt(v.fTractionCurveMax)}" />
      <fTractionCurveMin value="${fmt(v.fTractionCurveMin)}" />
      <fTractionCurveLateral value="22.500000" />
      <fTractionSpringDeltaMax value="0.150000" />
      <fLowSpeedTractionLossMult value="${fmt(v.fLowSpeedTractionLossMult)}" />
      <fCamberStiffnesss value="0.000000" />
      <fTractionBiasFront value="${fmt(v.fTractionBiasFront)}" />
      <fTractionLossMult value="${fmt(v.fTractionLossMult)}" />
      <fSuspensionForce value="${fmt(v.fSuspensionForce)}" />
      <fSuspensionCompDamp value="${fmt(v.fSuspensionCompDamp)}" />
      <fSuspensionReboundDamp value="${fmt(v.fSuspensionReboundDamp)}" />
      <fSuspensionUpperLimit value="${fmt(v.fSuspensionUpperLimit)}" />
      <fSuspensionLowerLimit value="${fmt(v.fSuspensionLowerLimit)}" />
      <fSuspensionRaise value="${fmt(v.fSuspensionRaise)}" />
      <fSuspensionBiasFront value="${fmt(v.fSuspensionBiasFront)}" />
      <fAntiRollBarForce value="${fmt(v.fAntiRollBarForce)}" />
      <fAntiRollBarBiasFront value="${fmt(v.fAntiRollBarBiasFront)}" />
      <fRollCentreHeightFront value="0.300000" />
      <fRollCentreHeightRear value="0.200000" />
      <fCollisionDamageMult value="${fmt(v.fCollisionDamageMult)}" />
      <fWeaponDamageMult value="${fmt(v.fWeaponDamageMult)}" />
      <fDeformationDamageMult value="${fmt(v.fDeformationDamageMult)}" />
      <fEngineDamageMult value="${fmt(v.fEngineDamageMult)}" />
      <fPetrolTankVolume value="65.000000" />
      <fOilVolume value="3.500000" />
      <nMonetaryValue value="100000" />
      <strModelFlags>440000</strModelFlags>
      <strHandlingFlags>0</strHandlingFlags>
      <strDamageFlags>0</strDamageFlags>
      <AIHandling>AVERAGE</AIHandling>
      <SubHandlingData>
        <Item type="NULL" />
        <Item type="NULL" />
        <Item type="NULL" />
      </SubHandlingData>
    </Item>
  </HandlingData>
</CHandlingDataMgr>`;
}

// ── Reemplaza solo los campos editados en el XML original ─────────────────────
// Garantiza que strModelFlags, SubHandlingData, vecCentreOfMassOffset, etc.
// siempre vengan del archivo original del carro — nunca inventados.
export function applyHandlingChanges(
  originalXml: string,
  changes: Record<string, number>
): string {
  let xml = originalXml;
  for (const [field, value] of Object.entries(changes)) {
    // Patrón: <fieldName value="1.234567" />  (todos los campos float/int)
    xml = xml.replace(
      new RegExp(`(<${field}\\s+value=")[^"]*("\\s*/?>)`, "gi"),
      `$1${value.toFixed(6)}$2`
    );
    // Patrón: <fieldName>VALUE</fieldName>  (fallback para campos de texto como nMonetaryValue)
    xml = xml.replace(
      new RegExp(`(<${field}>)[^<]*(</\\s*${field}\\s*>)`, "gi"),
      `$1${value}$2`
    );
  }
  return xml;
}

// ── Extrae campos numéricos del XML como Record<string, number> ────────────────
// Útil para rellenar el editor con valores del handling.meta original
export function parseHandlingXml(xml: string): Record<string, number> {
  const result: Record<string, number> = {};
  // value="..." attribute
  for (const m of xml.matchAll(/<(\w+)\s+value="([^"]+)"\s*\/?>/gi)) {
    const v = parseFloat(m[2]);
    if (!isNaN(v)) result[m[1]] = v;
  }
  // <fieldName>VALUE</fieldName>
  for (const m of xml.matchAll(/<(\w+)>([^<]+)<\/\s*\w+\s*>/gi)) {
    const v = parseFloat(m[2]);
    if (!isNaN(v)) result[m[1]] = v;
  }
  return result;
}

// ── Calcula stats visuales (0-100) a partir de los valores de handling
export function calcVisualStats(v: Partial<HandlingValues>) {
  const speed        = Math.min(100, Math.round(((v.fInitialDriveMaxFlatVel ?? 150) / 320) * 100));
  const acceleration = Math.min(100, Math.round(((v.fInitialDriveForce ?? 0.3) / 0.6) * 100));
  const braking      = Math.min(100, Math.round(((v.fBrakeForce ?? 0.5) / 1.2) * 100));
  const handling     = Math.min(100, Math.round((
    ((v.fTractionCurveMax ?? 2) / 3.5) * 0.4 +
    ((v.fSuspensionForce ?? 2) / 4)   * 0.3 +
    (1 - (v.fDriveInertia ?? 1) / 2)  * 0.3
  ) * 100));
  return { speed, acceleration, braking, handling };
}

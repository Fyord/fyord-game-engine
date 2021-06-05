import { Position } from '../types/position';

export function GetPositionChangeFromDistanceAndAngle(distance: number, angle: number): Position {
  const aRad = angle * (Math.PI / 180);
  const aValue = distance * Math.sin(aRad);
  const bValue = distance * Math.cos(aRad);

  return { x: bValue, y: aValue };
}

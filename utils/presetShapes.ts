import { Point2D } from '@/types/room';

export type ShapeType = 'rectangle' | 'lShape' | 'uShape';

export interface ShapeParams {
  rectangle: {
    width: number;  // cm
    depth: number;  // cm
  };
  lShape: {
    width: number;      // 全体の幅 cm
    depth: number;      // 全体の奥行き cm
    cutoutWidth: number;  // 切り欠き幅 cm
    cutoutDepth: number;  // 切り欠き奥行き cm
  };
  uShape: {
    width: number;         // 全体の幅 cm
    depth: number;         // 全体の奥行き cm
    openingWidth: number;  // 開口部の幅 cm
    armDepth: number;      // 両腕の奥行き cm
  };
}

/**
 * cmをmに変換
 */
function cmToM(cm: number): number {
  return cm / 100;
}

/**
 * 四角形の頂点を生成
 */
export function generateRectangle(params: ShapeParams['rectangle']): Point2D[] {
  const w = cmToM(params.width);
  const d = cmToM(params.depth);
  
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: d },
    { x: 0, y: d },
  ];
}

/**
 * L字型の頂点を生成（右下が切り欠き）
 */
export function generateLShape(params: ShapeParams['lShape']): Point2D[] {
  const w = cmToM(params.width);
  const d = cmToM(params.depth);
  const cw = cmToM(params.cutoutWidth);
  const cd = cmToM(params.cutoutDepth);
  
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: d - cd },
    { x: w - cw, y: d - cd },
    { x: w - cw, y: d },
    { x: 0, y: d },
  ];
}

/**
 * コの字型の頂点を生成
 */
export function generateUShape(params: ShapeParams['uShape']): Point2D[] {
  const w = cmToM(params.width);
  const d = cmToM(params.depth);
  const ow = cmToM(params.openingWidth);
  const ad = cmToM(params.armDepth);
  
  const armWidth = (w - ow) / 2;
  
  return [
    { x: 0, y: 0 },
    { x: armWidth, y: 0 },
    { x: armWidth, y: d - ad },
    { x: armWidth + ow, y: d - ad },
    { x: armWidth + ow, y: 0 },
    { x: w, y: 0 },
    { x: w, y: d },
    { x: 0, y: d },
  ];
}

/**
 * プリセット形状のデフォルト値
 */
export const defaultShapeParams: ShapeParams = {
  rectangle: {
    width: 400,
    depth: 300,
  },
  lShape: {
    width: 500,
    depth: 400,
    cutoutWidth: 200,
    cutoutDepth: 200,
  },
  uShape: {
    width: 600,
    depth: 400,
    openingWidth: 200,
    armDepth: 200,
  },
};
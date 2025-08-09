import { Furniture, FurnitureSize, Point3D, FurnitureRotation } from '@/types/furniture';

/**
 * ユニークな家具IDを生成
 */
export function generateFurnitureId(): string {
  return `furniture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * センチメートルをメートルに変換
 */
export function cmToM(cm: number): number {
  return cm / 100;
}

/**
 * メートルをセンチメートルに変換
 */
export function mToCm(m: number): number {
  return m * 100;
}

/**
 * デフォルトの家具位置を生成
 */
export function getDefaultPosition(): Point3D {
  return { x: 0, y: 0, z: 0 };
}

/**
 * デフォルトの家具回転を生成
 */
export function getDefaultRotation(): FurnitureRotation {
  return { x: 0, y: 0, z: 0 };
}

/**
 * 家具が部屋の境界内にあるかチェック（簡易版）
 */
export function isFurnitureInBounds(furniture: Furniture, roomBounds: { minX: number; maxX: number; minZ: number; maxZ: number }): boolean {
  const halfWidth = cmToM(furniture.size.width) / 2;
  const halfDepth = cmToM(furniture.size.depth) / 2;
  
  const minX = furniture.position.x - halfWidth;
  const maxX = furniture.position.x + halfWidth;
  const minZ = furniture.position.z - halfDepth;
  const maxZ = furniture.position.z + halfDepth;
  
  return (
    minX >= roomBounds.minX &&
    maxX <= roomBounds.maxX &&
    minZ >= roomBounds.minZ &&
    maxZ <= roomBounds.maxZ
  );
}

/**
 * 家具同士の衝突をチェック（簡易版）
 */
export function checkFurnitureCollision(furniture1: Furniture, furniture2: Furniture): boolean {
  if (furniture1.id === furniture2.id || furniture1.roomId !== furniture2.roomId) {
    return false;
  }
  
  const half1Width = cmToM(furniture1.size.width) / 2;
  const half1Depth = cmToM(furniture1.size.depth) / 2;
  const half1Height = cmToM(furniture1.size.height) / 2;
  
  const half2Width = cmToM(furniture2.size.width) / 2;
  const half2Depth = cmToM(furniture2.size.depth) / 2;
  const half2Height = cmToM(furniture2.size.height) / 2;
  
  // AABB (Axis-Aligned Bounding Box) 衝突判定
  return (
    Math.abs(furniture1.position.x - furniture2.position.x) < (half1Width + half2Width) &&
    Math.abs(furniture1.position.y - furniture2.position.y) < (half1Height + half2Height) &&
    Math.abs(furniture1.position.z - furniture2.position.z) < (half1Depth + half2Depth)
  );
}
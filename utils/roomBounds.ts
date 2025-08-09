import { Room } from '@/types/room';
import { Point2D } from '@/types/room';

export interface RoomBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * 部屋の境界を計算
 */
export function calculateRoomBounds(room: Room): RoomBounds {
  if (room.vertices.length === 0) {
    return { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  }

  let minX = room.vertices[0].x;
  let maxX = room.vertices[0].x;
  let minY = room.vertices[0].y;
  let maxY = room.vertices[0].y;

  room.vertices.forEach(vertex => {
    minX = Math.min(minX, vertex.x);
    maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
  });

  // Y座標をZ座標にマップ（Three.jsの座標系に合わせる）
  return {
    minX,
    maxX,
    minZ: minY,
    maxZ: maxY,
  };
}

/**
 * 点が多角形内部にあるかどうかをチェック（レイキャスト法）
 */
export function isPointInPolygon(point: { x: number; z: number }, vertices: Point2D[]): boolean {
  let inside = false;
  const x = point.x;
  const y = point.z; // Z座標をY座標に変換

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * 家具が部屋内に収まるように位置を制限
 */
export function constrainFurnitureToRoom(
  position: { x: number; z: number },
  furnitureSize: { width: number; depth: number }, // メートル単位
  room: Room
): { x: number; z: number } {
  const bounds = calculateRoomBounds(room);
  const halfWidth = furnitureSize.width / 2;
  const halfDepth = furnitureSize.depth / 2;

  // 基本的な境界チェック
  let constrainedX = Math.max(bounds.minX + halfWidth, Math.min(bounds.maxX - halfWidth, position.x));
  let constrainedZ = Math.max(bounds.minZ + halfDepth, Math.min(bounds.maxZ - halfDepth, position.z));

  // 家具の4つの角が部屋内にあるかチェック
  const corners = [
    { x: constrainedX - halfWidth, z: constrainedZ - halfDepth },
    { x: constrainedX + halfWidth, z: constrainedZ - halfDepth },
    { x: constrainedX + halfWidth, z: constrainedZ + halfDepth },
    { x: constrainedX - halfWidth, z: constrainedZ + halfDepth },
  ];

  const allCornersInside = corners.every(corner => isPointInPolygon(corner, room.vertices));

  // 全ての角が内部にない場合は、元の位置に戻すか、部屋の中心に近づける
  if (!allCornersInside) {
    // 部屋の中心座標を計算
    const centerX = room.vertices.reduce((sum, v) => sum + v.x, 0) / room.vertices.length;
    const centerZ = room.vertices.reduce((sum, v) => sum + v.y, 0) / room.vertices.length;
    
    // 中心に向かって少し移動
    const towardsCenterX = centerX > constrainedX ? constrainedX + 0.1 : constrainedX - 0.1;
    const towardsCenterZ = centerZ > constrainedZ ? constrainedZ + 0.1 : constrainedZ - 0.1;
    
    return { x: towardsCenterX, z: towardsCenterZ };
  }

  return { x: constrainedX, z: constrainedZ };
}
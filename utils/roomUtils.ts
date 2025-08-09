import { Point2D } from '@/types/room';

/**
 * 頂点入力文字列をPoint2D配列に変換
 * 例: "0,0 5,0 5,3 0,3" -> [{x:0,y:0}, {x:5,y:0}, {x:5,y:3}, {x:0,y:3}]
 */
export function parseVertices(input: string): Point2D[] {
  try {
    const vertices = input
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [x, y] = pair.split(',').map(Number);
        if (isNaN(x) || isNaN(y)) {
          throw new Error('Invalid coordinate');
        }
        return { x, y };
      });

    // 最低3頂点必要
    if (vertices.length < 3) {
      throw new Error('At least 3 vertices required');
    }

    return vertices;
  } catch {
    return [];
  }
}

/**
 * 頂点が直交多角形（90度の角のみ）かどうかを検証
 */
export function validateOrthogonalPolygon(vertices: Point2D[]): boolean {
  if (vertices.length < 3) return false;

  for (let i = 0; i < vertices.length; i++) {
    const prev = vertices[(i - 1 + vertices.length) % vertices.length];
    const curr = vertices[i];
    const next = vertices[(i + 1) % vertices.length];

    // 隣接する辺が水平または垂直でなければならない
    const edge1Horizontal = prev.y === curr.y;
    const edge1Vertical = prev.x === curr.x;
    const edge2Horizontal = curr.y === next.y;
    const edge2Vertical = curr.x === next.x;

    // どちらかの辺が斜めの場合は無効
    if (!edge1Horizontal && !edge1Vertical) return false;
    if (!edge2Horizontal && !edge2Vertical) return false;

    // 同じ方向の連続する辺は無効（180度の角）
    if ((edge1Horizontal && edge2Horizontal) || (edge1Vertical && edge2Vertical)) {
      return false;
    }
  }

  return true;
}

/**
 * ユニークなIDを生成
 */
export function generateId(): string {
  return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
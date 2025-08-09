import React, { useRef } from 'react';
import { Room } from '@/types/room';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface Room3DProps {
  room: Room;
  isActive?: boolean;
}

export default function Room3D({ room, isActive = false }: Room3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const wallMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  // 頂点から床面のジオメトリを作成
  const createFloorGeometry = () => {
    const shape = new THREE.Shape();
    
    // 最初の頂点に移動 (Y座標を-Zにマップ)
    shape.moveTo(room.vertices[0].x, -room.vertices[0].y);
    
    // 残りの頂点に線を描く
    for (let i = 1; i < room.vertices.length; i++) {
      shape.lineTo(room.vertices[i].x, -room.vertices[i].y);
    }
    
    // 形状を閉じる
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  };

  // 壁面のジオメトリを作成
  const createWallGeometries = () => {
    const geometries: THREE.PlaneGeometry[] = [];
    
    for (let i = 0; i < room.vertices.length; i++) {
      const current = room.vertices[i];
      const next = room.vertices[(i + 1) % room.vertices.length];
      
      // 壁の長さを計算
      const wallLength = Math.sqrt(
        Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
      );
      
      // 壁のジオメトリを作成
      const geometry = new THREE.PlaneGeometry(wallLength, room.height);
      geometries.push(geometry);
    }
    
    return geometries;
  };

  // カメラ位置に応じて壁の透明度を更新
  useFrame(() => {
    if (!groupRef.current) return;
    
    const roomCenter = new THREE.Vector3(0, room.height / 2, 0);
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // カメラの位置から部屋の中心への方向ベクトル
    const toCameraVector = new THREE.Vector3();
    toCameraVector.subVectors(camera.position, roomCenter).normalize();
    
    // 各壁に対して透明度を計算
    wallMaterials.current.forEach((material, index) => {
      if (!material) return;
      
      const vertex = room.vertices[index];
      const nextVertex = room.vertices[(index + 1) % room.vertices.length];
      
      // 壁の法線ベクトル（外向き）を計算
      const wallDirection = new THREE.Vector3(
        nextVertex.x - vertex.x,
        0,
        -(nextVertex.y - vertex.y)
      ).normalize();
      
      const wallNormal = new THREE.Vector3(
        -wallDirection.z,
        0,
        wallDirection.x
      );
      
      // カメラから壁への角度を計算
      const angle = toCameraVector.dot(wallNormal);
      
      // カメラが壁の外側にある場合、透明度を下げる
      if (angle > 0.2) {
        material.opacity = Math.max(0.1, 1 - angle);
        material.transparent = true;
      } else {
        material.opacity = 1;
        material.transparent = false;
      }
    });
  });

  const floorGeometry = createFloorGeometry();
  const wallGeometries = createWallGeometries();

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 床面 - Y=0の平面に配置 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <primitive object={floorGeometry} />
        <meshStandardMaterial 
          color={room.floorColor || '#e0e0e0'} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 壁面 */}
      {room.vertices.map((vertex, index) => {
        const nextVertex = room.vertices[(index + 1) % room.vertices.length];
        
        // 壁の中心位置を計算 (Three.jsの座標系に合わせる)
        const centerX = (vertex.x + nextVertex.x) / 2;
        const centerZ = -(vertex.y + nextVertex.y) / 2; // Y座標をZ座標にマップ（反転）
        const centerY = room.height / 2; // 壁の高さの中心
        
        // 壁の角度を計算
        const angle = Math.atan2(-(nextVertex.y - vertex.y), nextVertex.x - vertex.x);
        
        // マテリアルをrefに保存
        if (!wallMaterials.current[index]) {
          wallMaterials.current[index] = new THREE.MeshStandardMaterial({
            color: room.wallColor || '#ffffff',
            side: THREE.DoubleSide,
          });
        }
        
        return (
          <mesh
            key={`wall-${index}`}
            position={[centerX, centerY, centerZ]}
            rotation={[0, angle, 0]}
          >
            <primitive object={wallGeometries[index]} />
            <primitive object={wallMaterials.current[index]} />
          </mesh>
        );
      })}
      
      {/* アクティブな部屋の輪郭表示 */}
      {isActive && (
        <lineSegments>
          <edgesGeometry args={[floorGeometry]} />
          <lineBasicMaterial color="#3b82f6" linewidth={3} />
        </lineSegments>
      )}
    </group>
  );
}
import React, { useRef, useState } from 'react';
import { Furniture } from '@/types/furniture';
import { useApp } from '@/contexts/AppContext';
import { cmToM } from '@/utils/furnitureUtils';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

interface Furniture3DProps {
  furniture: Furniture;
  isActive?: boolean;
}

export default function Furniture3D({ furniture, isActive = false }: Furniture3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { updateFurniture, setActiveFurnitureId } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPlane] = useState(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const [dragOffset] = useState(new THREE.Vector3());

  // 家具のサイズをメートルに変換
  const width = cmToM(furniture.size.width);
  const height = cmToM(furniture.size.height);
  const depth = cmToM(furniture.size.depth);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setActiveFurnitureId(furniture.id);
    setIsDragging(true);

    // ドラッグ開始時のオフセットを計算
    const intersection = e.intersections[0];
    if (intersection) {
      dragOffset.copy(intersection.point).sub(furniture.position as any);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;

    e.stopPropagation();
    
    // レイキャストでドラッグ平面との交点を計算
    const camera = e.camera;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // マウス座標を正規化
    mouse.x = (e.nativeEvent.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.nativeEvent.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);
    
    if (intersection) {
      const newPosition = intersection.sub(dragOffset);
      
      // 新しい位置で家具を更新
      updateFurniture(furniture.id, {
        position: {
          x: newPosition.x,
          y: furniture.position.y, // Y座標は固定
          z: newPosition.z,
        }
      });
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveFurnitureId(furniture.id);
  };

  return (
    <group
      position={[furniture.position.x, furniture.position.y + height / 2, furniture.position.z]}
      rotation={[furniture.rotation.x, furniture.rotation.y, furniture.rotation.z]}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={furniture.color}
          opacity={isDragging ? 0.7 : 1}
          transparent={isDragging}
        />
      </mesh>

      {/* アクティブな家具の輪郭表示 */}
      {isActive && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
          <lineBasicMaterial color="#10b981" linewidth={2} />
        </lineSegments>
      )}

      {/* ドラッグ中の影表示 */}
      {isDragging && (
        <mesh
          position={[0, -height / 2 - 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[width * 1.1, depth * 1.1]} />
          <meshBasicMaterial 
            color="#000000" 
            opacity={0.2} 
            transparent 
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
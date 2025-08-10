import React, { useRef, useState } from 'react';
import { Furniture } from '@/types/furniture';
import { useApp } from '@/contexts/AppContext';
import { cmToM } from '@/utils/furnitureUtils';
import { constrainFurnitureToRoom } from '@/utils/roomBounds';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';

interface Furniture3DProps {
  furniture: Furniture;
  isActive?: boolean;
}

export default function Furniture3D({ furniture, isActive = false }: Furniture3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { updateFurniture, setActiveFurnitureId, rooms } = useApp();
  const { gl, camera, scene } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const [dragPlane] = useState(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const [raycaster] = useState(new THREE.Raycaster());
  const [initialMouseY, setInitialMouseY] = useState(0);
  const [initialFurnitureY, setInitialFurnitureY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState<{x: number, z: number} | null>(null);
  const [initialMousePosition, setInitialMousePosition] = useState<{x: number, y: number} | null>(null);

  // 家具のサイズをメートルに変換
  const width = cmToM(furniture.size.width);
  const height = cmToM(furniture.size.height);
  const depth = cmToM(furniture.size.depth);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    
    // アクティブ状態の場合のみドラッグを開始
    if (isActive) {
      setIsDragging(true);

      // OrbitControlsを無効化
      const controls = scene.userData.orbitControls;
      if (controls) {
        controls.enabled = false;
      }
    }
  };

  // キーボードイベントのハンドリング
  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      // input、textareaなどのフォーカスがある場合は無効にする
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.tagName === 'BUTTON' ||
        activeElement.contentEditable === 'true'
      )) {
        return;
      }

      // サイドバー内でのキーボード操作の場合は無効にする
      if (activeElement && activeElement.closest('aside')) {
        return;
      }

      const step = 0.1; // 移動ステップ（メートル）
      const rotationStep = Math.PI / 8; // 回転ステップ（22.5度）
      const sizeStep = 5; // サイズステップ（cm）

      switch (e.key) {
        // 回転
        case 'r':
        case 'R':
          updateFurniture(furniture.id, {
            rotation: {
              ...furniture.rotation,
              y: furniture.rotation.y + rotationStep,
            }
          });
          break;

        // サイズ変更
        case '=':
        case '+':
          updateFurniture(furniture.id, {
            size: {
              width: Math.min(furniture.size.width + sizeStep, 500),
              height: Math.min(furniture.size.height + sizeStep, 400),
              depth: Math.min(furniture.size.depth + sizeStep, 500),
            }
          });
          break;

        case '-':
        case '_':
          updateFurniture(furniture.id, {
            size: {
              width: Math.max(furniture.size.width - sizeStep, 10),
              height: Math.max(furniture.size.height - sizeStep, 10),
              depth: Math.max(furniture.size.depth - sizeStep, 10),
            }
          });
          break;

        // 選択解除
        case 'Enter':
          e.preventDefault();
          setIsDragging(false);
          setIsVerticalDragging(false);
          
          // OrbitControlsを再有効化
          const controls = scene.userData.orbitControls;
          if (controls) {
            controls.enabled = true;
          }
          
          setActiveFurnitureId(null);
          break;

        // 微調整移動（ユーザー視点基準でグリッド軸に沿った移動）
        case 'ArrowUp':
          e.preventDefault();
          
          if (e.shiftKey) {
            // Y軸移動（上に移動）
            updateFurniture(furniture.id, {
              position: { 
                ...furniture.position, 
                y: Math.min(furniture.position.y + step, 5.0) // 最大高さ5メートルに制限
              }
            });
          } else {
            // 通常の水平移動（ユーザーから見て前方向）
            const camera1 = camera;
            const cameraDirection1 = new THREE.Vector3();
            camera1.getWorldDirection(cameraDirection1);
            
            const cameraRight1 = new THREE.Vector3();
            cameraRight1.crossVectors(cameraDirection1, camera1.up).normalize();
            
            const cameraForward1 = new THREE.Vector3();
            cameraForward1.crossVectors(new THREE.Vector3(0, 1, 0), cameraRight1).normalize();
            
            // X軸とZ軸のどちらにより近いかを判定
            const absX1 = Math.abs(cameraForward1.x);
            const absZ1 = Math.abs(cameraForward1.z);
            
            const room1 = rooms.find(r => r.id === furniture.roomId);
            let newPos1;
            if (absX1 > absZ1) {
              // X軸方向に移動
              newPos1 = { 
                x: furniture.position.x + (cameraForward1.x > 0 ? step : -step), 
                z: furniture.position.z 
              };
            } else {
              // Z軸方向に移動
              newPos1 = { 
                x: furniture.position.x, 
                z: furniture.position.z + (cameraForward1.z > 0 ? step : -step) 
              };
            }
            const constrainedPos1 = room1 ? constrainFurnitureToRoom(newPos1, { width, depth }, room1) : newPos1;
            updateFurniture(furniture.id, {
              position: { ...furniture.position, x: constrainedPos1.x, z: constrainedPos1.z }
            });
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          
          if (e.shiftKey) {
            // Y軸移動（下に移動）
            updateFurniture(furniture.id, {
              position: { 
                ...furniture.position, 
                y: Math.max(furniture.position.y - step, height / 2) // 床に埋まらないように制限
              }
            });
          } else {
            // 通常の水平移動（ユーザーから見て後方向）
            const camera2 = camera;
            const cameraDirection2 = new THREE.Vector3();
            camera2.getWorldDirection(cameraDirection2);
            
            const cameraRight2 = new THREE.Vector3();
            cameraRight2.crossVectors(cameraDirection2, camera2.up).normalize();
            
            const cameraForward2 = new THREE.Vector3();
            cameraForward2.crossVectors(new THREE.Vector3(0, 1, 0), cameraRight2).normalize();
            
            const absX2 = Math.abs(cameraForward2.x);
            const absZ2 = Math.abs(cameraForward2.z);
            
            const room2 = rooms.find(r => r.id === furniture.roomId);
            let newPos2;
            if (absX2 > absZ2) {
              // X軸方向に移動
              newPos2 = { 
                x: furniture.position.x + (cameraForward2.x > 0 ? -step : step), 
                z: furniture.position.z 
              };
            } else {
              // Z軸方向に移動
              newPos2 = { 
                x: furniture.position.x, 
                z: furniture.position.z + (cameraForward2.z > 0 ? -step : step) 
              };
            }
            const constrainedPos2 = room2 ? constrainFurnitureToRoom(newPos2, { width, depth }, room2) : newPos2;
            updateFurniture(furniture.id, {
              position: { ...furniture.position, x: constrainedPos2.x, z: constrainedPos2.z }
            });
          }
          break;

        case 'ArrowLeft': // ユーザーから見て左方向（最も近いグリッド軸に沿って）
          e.preventDefault();
          const camera3 = camera;
          const cameraDirection3 = new THREE.Vector3();
          camera3.getWorldDirection(cameraDirection3);
          
          const cameraRight3 = new THREE.Vector3();
          cameraRight3.crossVectors(cameraDirection3, camera3.up).normalize();
          
          const absX3 = Math.abs(cameraRight3.x);
          const absZ3 = Math.abs(cameraRight3.z);
          
          const room3 = rooms.find(r => r.id === furniture.roomId);
          let newPos3;
          if (absX3 > absZ3) {
            // X軸方向に移動
            newPos3 = { 
              x: furniture.position.x + (cameraRight3.x > 0 ? -step : step), 
              z: furniture.position.z 
            };
          } else {
            // Z軸方向に移動
            newPos3 = { 
              x: furniture.position.x, 
              z: furniture.position.z + (cameraRight3.z > 0 ? -step : step) 
            };
          }
          const constrainedPos3 = room3 ? constrainFurnitureToRoom(newPos3, { width, depth }, room3) : newPos3;
          updateFurniture(furniture.id, {
            position: { ...furniture.position, x: constrainedPos3.x, z: constrainedPos3.z }
          });
          break;

        case 'ArrowRight': // ユーザーから見て右方向（最も近いグリッド軸に沿って）
          e.preventDefault();
          const camera4 = camera;
          const cameraDirection4 = new THREE.Vector3();
          camera4.getWorldDirection(cameraDirection4);
          
          const cameraRight4 = new THREE.Vector3();
          cameraRight4.crossVectors(cameraDirection4, camera4.up).normalize();
          
          const absX4 = Math.abs(cameraRight4.x);
          const absZ4 = Math.abs(cameraRight4.z);
          
          const room4 = rooms.find(r => r.id === furniture.roomId);
          let newPos4;
          if (absX4 > absZ4) {
            // X軸方向に移動
            newPos4 = { 
              x: furniture.position.x + (cameraRight4.x > 0 ? step : -step), 
              z: furniture.position.z 
            };
          } else {
            // Z軸方向に移動
            newPos4 = { 
              x: furniture.position.x, 
              z: furniture.position.z + (cameraRight4.z > 0 ? step : -step) 
            };
          }
          const constrainedPos4 = room4 ? constrainFurnitureToRoom(newPos4, { width, depth }, room4) : newPos4;
          updateFurniture(furniture.id, {
            position: { ...furniture.position, x: constrainedPos4.x, z: constrainedPos4.z }
          });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, furniture, updateFurniture, width, depth, rooms, camera, height, setActiveFurnitureId, scene.userData.orbitControls]);

  React.useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      // Shiftキーが押されている場合は垂直移動
      if (e.shiftKey) {
        // 垂直ドラッグ処理
        if (!isVerticalDragging) {
          // 初回のShift+ドラッグ時に初期値を設定
          setIsVerticalDragging(true);
          setInitialMouseY(e.clientY);
          setInitialFurnitureY(furniture.position.y);
          return;
        }
        
        // マウスのY座標変化から高さを計算
        const deltaY = initialMouseY - e.clientY; // 上に動かすと正の値
        const heightChange = deltaY * 0.01; // スケーリング調整
        const newY = Math.max(
          height / 2, // 床に埋まらない
          Math.min(5.0, initialFurnitureY + heightChange) // 最大高さ5メートル
        );

        updateFurniture(furniture.id, {
          position: {
            ...furniture.position,
            y: newY,
          }
        });
      } else {
        // 通常の水平ドラッグ処理
        setIsVerticalDragging(false);
        
        if (!dragStartPosition || !initialMousePosition) {
          // 初期位置が設定されていない場合は設定
          const canvas = gl.domElement;
          const rect = canvas.getBoundingClientRect();
          setInitialMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          setDragStartPosition({
            x: furniture.position.x,
            z: furniture.position.z
          });
          return;
        }
        
        const canvas = gl.domElement;
        const rect = canvas.getBoundingClientRect();
        
        // マウスの移動量を計算
        const deltaX = (e.clientX - rect.left) - initialMousePosition.x;
        const deltaY = (e.clientY - rect.top) - initialMousePosition.y;
        
        // 画面上の移動量を3D空間の移動量に変換
        const movementScale = 0.01; // スケール調整
        const cameraDistance = camera.position.distanceTo(new THREE.Vector3(furniture.position.x, furniture.position.y, furniture.position.z));
        const scaledMovement = movementScale * (cameraDistance / 10); // カメラ距離に応じてスケール調整
        
        // カメラの向きに基づいて移動方向を計算
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, camera.up).normalize();
        
        const cameraUp = new THREE.Vector3(0, 1, 0);
        const cameraForward = new THREE.Vector3();
        cameraForward.crossVectors(cameraUp, cameraRight).normalize();
        
        // 新しい位置を計算
        let newPosition = {
          x: dragStartPosition.x + (cameraRight.x * deltaX + cameraForward.x * (-deltaY)) * scaledMovement,
          z: dragStartPosition.z + (cameraRight.z * deltaX + cameraForward.z * (-deltaY)) * scaledMovement,
        };

        // 家具が属する部屋を取得
        const room = rooms.find(r => r.id === furniture.roomId);
        
        // 部屋内に制限
        if (room) {
          newPosition = constrainFurnitureToRoom(
            newPosition,
            { width, depth },
            room
          );
        }

        updateFurniture(furniture.id, {
          position: {
            x: newPosition.x,
            y: furniture.position.y,
            z: newPosition.z,
          }
        });
      }
    };

    const handleGlobalPointerUp = () => {
      setIsDragging(false);
      setIsVerticalDragging(false);
      
      // ドラッグ関連の状態をリセット
      setDragStartPosition(null);
      setInitialMousePosition(null);
      
      // OrbitControlsを再有効化
      const controls = scene.userData.orbitControls;
      if (controls) {
        controls.enabled = true;
      }
    };

    if (isDragging) {
      document.addEventListener('pointermove', handleGlobalPointerMove);
      document.addEventListener('pointerup', handleGlobalPointerUp);
    }

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove);
      document.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging, furniture.id, furniture.position, updateFurniture, gl.domElement, camera, raycaster, scene.userData.orbitControls, isVerticalDragging, initialMouseY, initialFurnitureY, height, depth, dragPlane, furniture.roomId, rooms, width, dragStartPosition, initialMousePosition]);

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveFurnitureId(furniture.id);
    
    // 通常のダブルクリック：水平ドラッグを開始
    setIsDragging(true);
    
    // ドラッグ開始位置を初期化（ダブルクリック時点でのマウス位置と家具位置を記録）
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    setInitialMousePosition({
      x: e.nativeEvent.clientX - rect.left,
      y: e.nativeEvent.clientY - rect.top
    });
    setDragStartPosition({
      x: furniture.position.x,
      z: furniture.position.z
    });
    
    // OrbitControlsを無効化
    const controls = scene.userData.orbitControls;
    if (controls) {
      controls.enabled = false;
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isDragging) { // ドラッグ中でない場合のみ
      e.stopPropagation();
      if (isActive) {
        // アクティブ状態の場合は解除
        setActiveFurnitureId(null);
      }
    }
  };

  return (
    <group
      position={[furniture.position.x, furniture.position.y + height / 2, furniture.position.z]}
      rotation={[furniture.rotation.x, furniture.rotation.y, furniture.rotation.z]}
    >
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshLambertMaterial 
          color={furniture.color}
          opacity={isDragging ? 0.7 : 1}
          transparent={isDragging}
        />
      </mesh>

      {/* 家具の輪郭表示 */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial 
          color={isActive ? "#10b981" : "#666666"} 
          linewidth={isActive ? 3 : 1}
          opacity={0.8}
          transparent
        />
      </lineSegments>

    </group>
  );
}
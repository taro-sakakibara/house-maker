"use client";

import React, { Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "@/contexts/AppContext";
import Room3D from "@/components/three/Room3D";
import Furniture3D from "@/components/three/Furniture3D";
import MobileControls from "@/components/MobileControls";
import { Furniture } from "@/types/furniture";

function Scene() {
  const {
    rooms,
    activeRoomId,
    furniture,
    activeFurnitureId,
    setActiveFurnitureId,
    updateFurniture,
  } = useApp();
  const controlsRef = React.useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { scene } = useThree();

  const handleBackgroundClick = () => {
    setActiveFurnitureId(null);
  };

  // OrbitControlsをsceneに保存
  React.useEffect(() => {
    if (controlsRef.current) {
      scene.userData.orbitControls = controlsRef.current;
    }
  }, [scene]);

  // 視点移動のキーボード操作
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 家具が選択されている場合は視点移動を無効にする
      if (activeFurnitureId) return;

      // input、textareaなどのフォーカスがある場合は無効にする
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.tagName === "BUTTON" ||
          activeElement.contentEditable === "true")
      ) {
        return;
      }

      // サイドバー内でのキーボード操作の場合は無効にする
      if (activeElement && activeElement.closest("aside")) {
        return;
      }

      const controls = controlsRef.current;
      if (!controls) return;

      const panStep = 1.0; // 移動ステップ
      const camera = controls.object;

      // カメラの向きベクトルを取得
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      // カメラの右方向ベクトルを計算
      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(cameraDirection, camera.up).normalize();

      // カメラの上方向ベクトル（Y軸固定）
      const cameraUp = new THREE.Vector3(0, 1, 0);

      // カメラの前方向ベクトル（Y軸を除いた水平面上の前方向）
      const cameraForward = new THREE.Vector3();
      cameraForward.crossVectors(cameraUp, cameraRight).normalize();

      switch (e.key) {
        case "ArrowUp": // 前方向（ユーザーから見て奥へ）
          e.preventDefault();
          const forwardDirection = cameraForward
            .clone()
            .multiplyScalar(panStep);
          controls.target.add(forwardDirection);
          controls.object.position.add(forwardDirection);
          controls.update();
          break;

        case "ArrowDown": // 後方向（ユーザーから見て手前へ）
          e.preventDefault();
          const backwardDirection = cameraForward
            .clone()
            .multiplyScalar(-panStep);
          controls.target.add(backwardDirection);
          controls.object.position.add(backwardDirection);
          controls.update();
          break;

        case "ArrowLeft": // 左方向（ユーザーから見て左へ）
          e.preventDefault();
          const leftDirection = cameraRight.clone().multiplyScalar(-panStep);
          controls.target.add(leftDirection);
          controls.object.position.add(leftDirection);
          controls.update();
          break;

        case "ArrowRight": // 右方向（ユーザーから見て右へ）
          e.preventDefault();
          const rightDirection = cameraRight.clone().multiplyScalar(panStep);
          controls.target.add(rightDirection);
          controls.object.position.add(rightDirection);
          controls.update();
          break;
      }

      // 家具が選択されている場合の操作
      if (activeFurnitureId) {
        const selectedFurniture = furniture.find((f: Furniture) => f.id === activeFurnitureId);
        if (!selectedFurniture) return;

        switch (e.key.toLowerCase()) {
          case "r":
            e.preventDefault();
            if (e.shiftKey) {
              // Shift+R: 垂直回転（X軸）
              const newVerticalRotation = {
                ...selectedFurniture.rotation,
                x: selectedFurniture.rotation.x + (Math.PI / 4)
              };
              updateFurniture(activeFurnitureId, { rotation: newVerticalRotation });
            } else {
              // R: 水平回転（Y軸）
              const newHorizontalRotation = {
                ...selectedFurniture.rotation,
                y: selectedFurniture.rotation.y + (Math.PI / 4)
              };
              updateFurniture(activeFurnitureId, { rotation: newHorizontalRotation });
            }
            break;

          case "+":
          case "=":
            e.preventDefault();
            const newLargerSize = {
              width: Math.min(500, selectedFurniture.size.width + 10), // 最大5m
              height: selectedFurniture.size.height,
              depth: Math.min(500, selectedFurniture.size.depth + 10)
            };
            updateFurniture(activeFurnitureId, { size: newLargerSize });
            break;

          case "-":
            e.preventDefault();
            const newSmallerSize = {
              width: Math.max(10, selectedFurniture.size.width - 10), // 最小10cm
              height: selectedFurniture.size.height,
              depth: Math.max(10, selectedFurniture.size.depth - 10)
            };
            updateFurniture(activeFurnitureId, { size: newSmallerSize });
            break;

          case "ArrowUp":
          case "ArrowDown":
          case "ArrowLeft":
          case "ArrowRight":
            e.preventDefault();
            const moveDistance = 0.5;
            // eslint-disable-next-line prefer-const
            let newPosition = { ...selectedFurniture.position };

            if (e.shiftKey) {
              // Shift + 矢印キー: 垂直移動
              switch (e.key) {
                case "ArrowUp":
                  newPosition.y += moveDistance;
                  break;
                case "ArrowDown":
                  newPosition.y -= moveDistance;
                  break;
              }
            } else {
              // 通常の矢印キー: 水平移動
              switch (e.key) {
                case "ArrowUp":
                  newPosition.z -= moveDistance;
                  break;
                case "ArrowDown":
                  newPosition.z += moveDistance;
                  break;
                case "ArrowLeft":
                  newPosition.x -= moveDistance;
                  break;
                case "ArrowRight":
                  newPosition.x += moveDistance;
                  break;
              }
            }
            updateFurniture(activeFurnitureId, { position: newPosition });
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeFurnitureId, furniture, updateFurniture]);

  return (
    <>
      {/* カメラ設定 */}
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={60} />

      {/* ライト設定 */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {/* 補助光 */}
      <directionalLight 
        position={[-10, 5, -10]} 
        intensity={0.3}
        color="#87CEEB"
      />

      {/* コントロール */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        panSpeed={1.0}
        rotateSpeed={0.5}
        zoomSpeed={1.0}
        zoomToCursor={true}
        mouseButtons={{
          LEFT: 0, // 左クリック：回転
          MIDDLE: 1, // ミドルクリック：ズーム
          RIGHT: 2, // 右クリック：パン（移動）
        }}
        touches={{
          ONE: 0, // 1本指：回転
          TWO: 2, // 2本指：パン・ズーム
        }}
      />

      {/* グリッド */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6e6e6e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d9d9d"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* 仮の床面 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onClick={handleBackgroundClick}
        receiveShadow
      >
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#f5f5f5" />
      </mesh>

      {/* 部屋の3D表示 */}
      {rooms.map((room) => (
        <Room3D key={room.id} room={room} isActive={room.id === activeRoomId} />
      ))}

      {/* 家具の3D表示 */}
      {furniture.map((item) => (
        <Furniture3D
          key={item.id}
          furniture={item}
          isActive={item.id === activeFurnitureId}
        />
      ))}

      {/* 部屋がない場合の仮のキューブ */}
      {rooms.length === 0 && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      )}
    </>
  );
}

export default function View3D() {
  const [isHelpOpen, setIsHelpOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { activeFurnitureId, updateFurniture, furniture } = useApp();

  // 画面サイズを監視してモバイルかどうか判定
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint = 1024px
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // モバイル専用ハンドラー関数
  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    if (!activeFurnitureId) return;
    
    const selectedFurniture = furniture.find((f: Furniture) => f.id === activeFurnitureId);
    if (!selectedFurniture) return;

    const moveDistance = 0.5;
    // eslint-disable-next-line prefer-const
    let newPosition = { ...selectedFurniture.position };

    switch (direction) {
      case "up":
        newPosition.z -= moveDistance;
        break;
      case "down":
        newPosition.z += moveDistance;
        break;
      case "left":
        newPosition.x -= moveDistance;
        break;
      case "right":
        newPosition.x += moveDistance;
        break;
    }

    updateFurniture(activeFurnitureId, { position: newPosition });
  };

  const handleRotate = () => {
    if (!activeFurnitureId) return;
    
    const selectedFurniture = furniture.find((f: Furniture) => f.id === activeFurnitureId);
    if (!selectedFurniture) return;

    const newRotation = {
      ...selectedFurniture.rotation,
      y: selectedFurniture.rotation.y + (Math.PI / 4)
    };
    updateFurniture(activeFurnitureId, { rotation: newRotation });
  };

  const handleVerticalRotate = () => {
    if (!activeFurnitureId) return;
    
    const selectedFurniture = furniture.find((f: Furniture) => f.id === activeFurnitureId);
    if (!selectedFurniture) return;

    const newRotation = {
      ...selectedFurniture.rotation,
      x: selectedFurniture.rotation.x + (Math.PI / 4)
    };
    updateFurniture(activeFurnitureId, { rotation: newRotation });
  };

  const handleSizeChange = (delta: number) => {
    if (!activeFurnitureId) return;
    
    const selectedFurniture = furniture.find((f: Furniture) => f.id === activeFurnitureId);
    if (!selectedFurniture) return;

    const deltaInCm = delta * 100;
    const newSize = {
      width: Math.max(10, selectedFurniture.size.width + deltaInCm),
      height: selectedFurniture.size.height,
      depth: Math.max(10, selectedFurniture.size.depth + deltaInCm)
    };

    updateFurniture(activeFurnitureId, { size: newSize });
  };

  return (
    <div className="flex-1 bg-gray-50 relative h-full">
      <Canvas 
        className="absolute inset-0"
        shadows
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* デスクトップ用の操作説明 */}
      {!isMobile && (
        <div className="absolute bottom-[10px] right-[10px]">
        {isHelpOpen ? (
          <div className="bg-white bg-opacity-90 p-[12px] rounded-lg text-sm shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-[4px]">
              <p className="font-semibold text-gray-800">操作方法（キーボード）</p>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-[4px] hover:bg-gray-100 rounded transition-colors"
                aria-label="操作説明を閉じる"
              >
                <svg
                  className="w-[16px] h-[16px] text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-[4px]">
              <p className="text-gray-600">視点回転: マウスドラッグ</p>
              <p className="text-gray-600">視点移動: 矢印キー</p>
              <p className="text-gray-600">ズーム: スクロール</p>
              <hr className="border-gray-300" />
              <p className="text-gray-600">家具選択: 家具をダブルクリック</p>
              <p className="text-gray-600">水平移動: 家具をドラッグ / 矢印キー</p>
              <p className="text-gray-600">垂直移動: Shift+ドラッグ / Shift+矢印キー</p>
              <p className="text-gray-600">水平回転: R キー</p>
              <p className="text-gray-600">垂直回転: Shift+R キー</p>
              <p className="text-gray-600">サイズ変更: + / - キー</p>
              <p className="text-gray-600">選択解除: 空白部分をクリック</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsHelpOpen(true)}
            className="bg-white bg-opacity-90 p-[8px] rounded-lg shadow-lg border border-gray-200 hover:bg-opacity-100 transition-all"
            aria-label="操作説明を表示"
          >
            <svg
              className="w-[20px] h-[20px] text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}
        </div>
      )}

      {/* モバイル用コントロール */}
      {isMobile && (
        <MobileControls
          onMove={handleMove}
          onRotate={handleRotate}
          onVerticalRotate={handleVerticalRotate}
          onSizeChange={handleSizeChange}
        />
      )}
    </div>
  );
}

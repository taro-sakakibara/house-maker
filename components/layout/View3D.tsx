"use client";

import React, { Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "@/contexts/AppContext";
import Room3D from "@/components/three/Room3D";
import Furniture3D from "@/components/three/Furniture3D";

function Scene() {
  const {
    rooms,
    activeRoomId,
    furniture,
    activeFurnitureId,
    setActiveFurnitureId,
  } = useApp();
  const controlsRef = React.useRef<any>(null);
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
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeFurnitureId]);

  return (
    <>
      {/* カメラ設定 */}
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={60} />

      {/* ライト設定 */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

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
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#f0f0f0" />
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
  return (
    <div className="flex-1 bg-gray-50 relative h-full">
      <Canvas className="absolute inset-0">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* 3D操作の説明 */}
      <div className="absolute bottom-[10px] left-[10px]">
        <div className="bg-white bg-opacity-90 p-[12px] rounded-lg text-sm shadow-lg border border-gray-200">
          <p className="font-semibold mb-[4px] text-gray-800">操作方法</p>
          <div className="space-y-[4px]">
            <p className="text-gray-600">視点回転: 3本指ドラッグ</p>
            <p className="text-gray-600">視点移動: 矢印キー</p>
            <p className="text-gray-600">ズーム: 2本指ピンチ / スクロール</p>
            <hr className="border-gray-300" />
            <p className="text-gray-600">家具選択: 家具をダブルタップ</p>
            <p className="text-gray-600">水平移動: 家具をドラッグ / 矢印キー</p>
            <p className="text-gray-600">
              垂直移動: Shift+ドラッグ / Shift+矢印キー
            </p>
            <p className="text-gray-600">家具回転: R キー</p>
            <p className="text-gray-600">サイズ変更: + / - キー</p>
            <p className="text-gray-600">選択解除: クリック / Enter キー</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/contexts/AppContext";

interface MobileControlsProps {
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  onRotate: () => void;
  onVerticalRotate: () => void;
  onSizeChange: (delta: number) => void;
}

export default function MobileControls({ onMove, onRotate, onVerticalRotate, onSizeChange }: MobileControlsProps) {
  const { activeFurnitureId } = useApp();
  const [isHelpOpen, setIsHelpOpen] = useState(false);


  if (!activeFurnitureId) return null;

  // モーダル用のポータル
  const modalContent = isHelpOpen && typeof window !== 'undefined' ? createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={() => setIsHelpOpen(false)}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '300px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-[16px]">
          <h3 className="text-[18px] font-bold text-gray-800">操作方法</h3>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="w-[32px] h-[32px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-[14px] leading-[1.5] space-y-[4px] text-gray-700">
          <p>視点回転: 1本指ドラッグ</p>
          <p>ズーム: 2本指ピンチ</p>
          <hr className="my-[8px] border-gray-200" />
          <p>家具選択: 家具をダブルタップ</p>
          <p>家具移動: 十字キーコントロール</p>
          <p>水平回転: 水平回転ボタン</p>
          <p>垂直回転: 垂直回転ボタン</p>
          <p>サイズ変更: +/- ボタン</p>
          <p>選択解除: 空白部分をタップ</p>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* ヘルプモーダル - ポータルで表示 */}
      {modalContent}
      
    <div className="absolute bottom-[20px] left-[20px] flex flex-col gap-[6px]">
      {/* 移動コントロール */}
      <div className="bg-white bg-opacity-90 rounded-lg shadow-lg border border-gray-200 p-[6px]">
        <div className="grid grid-cols-3 grid-rows-3 gap-[3px]">
          {/* 空セル */}
          <div />
          {/* 上ボタン */}
          <button
            onClick={() => onMove("up")}
            className="w-[32px] h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
            aria-label="上に移動"
          >
            <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          {/* 空セル */}
          <div />
          
          {/* 左ボタン */}
          <button
            onClick={() => onMove("left")}
            className="w-[32px] h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
            aria-label="左に移動"
          >
            <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* 中央空セル */}
          <div />
          {/* 右ボタン */}
          <button
            onClick={() => onMove("right")}
            className="w-[32px] h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
            aria-label="右に移動"
          >
            <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* 空セル */}
          <div />
          {/* 下ボタン */}
          <button
            onClick={() => onMove("down")}
            className="w-[32px] h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
            aria-label="下に移動"
          >
            <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* 空セル */}
          <div />
        </div>
      </div>

      {/* 回転・サイズコントロール */}
      <div className="bg-white bg-opacity-90 rounded-lg shadow-lg border border-gray-200 p-[6px] grid grid-cols-3 gap-[6px]">
        {/* 水平回転 */}
        <button
          onClick={onRotate}
          className="h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
          aria-label="水平回転"
        >
          <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        {/* 垂直回転 */}
        <button
          onClick={onVerticalRotate}
          className="h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
          aria-label="垂直回転"
        >
          <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" transform="rotate(90)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        {/* ヘルプ */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="h-[32px] bg-blue-100 hover:bg-blue-200 rounded-md flex items-center justify-center transition-colors"
          aria-label="ヘルプ"
        >
          <svg className="w-[16px] h-[16px] text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* サイズコントロール */}
      <div className="bg-white bg-opacity-90 rounded-lg shadow-lg border border-gray-200 p-[6px] flex gap-[6px]">
        <button
          onClick={() => onSizeChange(-0.1)}
          className="flex-1 h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
          aria-label="縮小"
        >
          <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={() => onSizeChange(0.1)}
          className="flex-1 h-[32px] bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
          aria-label="拡大"
        >
          <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
    </>
  );
}
"use client";

import React from "react";
import { useApp } from "@/contexts/AppContext";

interface FurnitureListProps {
  onEditFurniture?: (furniture: any) => void;
}

export default function FurnitureList({ onEditFurniture }: FurnitureListProps) {
  const {
    furniture,
    activeFurnitureId,
    setActiveFurnitureId,
    deleteFurniture,
    activeRoomId,
  } = useApp();

  const roomFurniture = furniture.filter(
    (item) => item.roomId === activeRoomId
  );

  if (!activeRoomId) {
    return (
      <div className="text-center py-8">
        <div className="bg-slate-100 rounded-full w-[64px] h-[64px] mx-auto mb-[16px] flex items-center justify-center">
          <svg
            className="w-[32px] h-[32px] text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h4 className="font-medium text-slate-700 mb-[8px]">
          部屋を選択してください
        </h4>
        <p className="text-sm text-slate-500">
          上の「部屋の設定」から部屋を選択してください
        </p>
      </div>
    );
  }

  if (roomFurniture.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-amber-100 rounded-full w-[64px] h-[64px] mx-auto mb-[16px] flex items-center justify-center">
          <svg
            className="w-[32px] h-[32px] text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h4 className="font-medium text-slate-700 mb-[8px]">
          家具が配置されていません
        </h4>
        <p className="text-sm text-slate-500">
          「+ 新規追加」ボタンから家具を追加してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[12px]">
      {roomFurniture.map((item) => (
        <div
          key={item.id}
          className={`p-[16px] rounded-xl cursor-pointer transition-all shadow-sm border ${
            activeFurnitureId === item.id
              ? "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          }`}
          onClick={() => setActiveFurnitureId(item.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-[12px] mb-[12px]">
                <div
                  className="w-[20px] h-[20px] rounded-lg shadow-sm border border-slate-200"
                  style={{ backgroundColor: item.color }}
                />
                <h3 className="font-semibold text-slate-800">{item.name}</h3>
                {activeFurnitureId === item.id && (
                  <div className="flex items-center space-x-[4px] bg-amber-100 text-amber-700 px-[8px] py-[4px] rounded-full text-xs font-medium">
                    <div className="w-[8px] h-[8px] bg-amber-500 rounded-full"></div>
                    <span>選択中</span>
                  </div>
                )}
              </div>
              <div className="space-y-[8px]">
                <div className="flex items-center space-x-[16px] text-sm text-slate-600">
                  <div className="flex items-center space-x-[4px]">
                    <svg
                      className="w-[16px] h-[16px] text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    <span>
                      {item.size.width}cm × {item.size.height}cm ×{" "}
                      {item.size.depth}cm
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-[16px] text-sm text-slate-500">
                  <div className="flex items-center space-x-[4px]">
                    <svg
                      className="w-[12px] h-[12px] text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>
                      位置: ({item.position.x.toFixed(1)},{" "}
                      {item.position.z.toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-[4px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditFurniture?.(item);
                }}
                className="flex items-center justify-center w-[32px] h-[32px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="編集"
              >
                <svg
                  className="w-[16px] h-[16px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFurniture(item.id);
                }}
                className="flex items-center justify-center w-[32px] h-[32px] text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="削除"
              >
                <svg
                  className="w-[16px] h-[16px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

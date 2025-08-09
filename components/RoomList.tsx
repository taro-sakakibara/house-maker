"use client";

import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Room } from "@/types/room";

interface RoomListProps {
  onEditRoom?: (room: Room) => void;
}

export default function RoomList({ onEditRoom }: RoomListProps) {
  const { rooms, activeRoomId, setActiveRoomId, deleteRoom } = useApp();

  if (rooms.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        部屋がまだ登録されていません
      </div>
    );
  }

  return (
    <div className="space-y-[12px]">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`p-[16px] rounded-xl cursor-pointer transition-all shadow-sm border ${
            activeRoomId === room.id
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-md"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          }`}
          onClick={() => setActiveRoomId(room.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-[8px] mb-[12px]">
                <h3 className="font-semibold text-slate-800">{room.name}</h3>
                {activeRoomId === room.id && (
                  <div className="flex items-center space-x-[4px] bg-emerald-100 text-emerald-700 px-[8px] py-[4px] rounded-full text-xs font-medium">
                    <div className="w-[8px] h-[8px] bg-emerald-500 rounded-full"></div>
                    <span>選択中</span>
                  </div>
                )}
              </div>
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
                    {(() => {
                      // 頂点から幅と奥行きを計算
                      const vertices = room.vertices;
                      let width = 0,
                        depth = 0;

                      if (vertices.length >= 4) {
                        // 幅の計算
                        width = Math.abs(vertices[1].x - vertices[0].x) * 100; // mからcmに変換

                        // 奥行きの計算 - より堅牢な方法
                        if (vertices[2].y != null && vertices[1].y != null) {
                          depth = Math.abs(vertices[2].y - vertices[1].y) * 100;
                        } else if (
                          vertices[3].y != null &&
                          vertices[0].y != null
                        ) {
                          depth = Math.abs(vertices[3].y - vertices[0].y) * 100;
                        } else {
                          // 全ての頂点のy座標をチェック
                          const validY = vertices
                            .map((v) => v.y)
                            .filter((y) => y != null);
                          if (validY.length >= 2) {
                            depth =
                              Math.abs(
                                Math.max(...validY) - Math.min(...validY)
                              ) * 100;
                          } else {
                            depth = 300; // デフォルト値
                          }
                        }
                      }

                      const height = room.height * 100; // mからcmに変換
                      return `${width.toFixed(0)}cm × ${depth.toFixed(
                        0
                      )}cm × ${height.toFixed(0)}cm`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-[4px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditRoom?.(room);
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
                  deleteRoom(room.id);
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

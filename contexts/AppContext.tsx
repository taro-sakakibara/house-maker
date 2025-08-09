'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Room } from '@/types/room';

interface AppContextType {
  rooms: Room[];
  activeRoomId: string | null;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, room: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  setActiveRoomId: (roomId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const addRoom = (room: Room) => {
    setRooms((prev) => [...prev, room]);
    setActiveRoomId(room.id);
  };

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room
      )
    );
  };

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        activeRoomId,
        addRoom,
        updateRoom,
        deleteRoom,
        setActiveRoomId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
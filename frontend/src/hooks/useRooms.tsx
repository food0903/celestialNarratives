import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

interface Room {
  room_id: number;
  room_name: string;
  status: string;
  num_players: number;
  max_players: number;
  created_at: string;
  actions?: string;
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      console.log('Setting up socket listeners');
      
      const handleRoomsData = (rooms: Room[]) => {
        console.log('Received rooms data:', rooms);
        setRooms(rooms);
      };

      const fetchRooms = () => {
        console.log('Fetching rooms');
        socket.emit('get_rooms');
      };

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        fetchRooms();
      });

      socket.on('rooms_data', handleRoomsData);

      if (socket.connected) {
        fetchRooms();
      }

      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('connect');
        socket.off('rooms_data', handleRoomsData);
      };
    }
  }, [socket]);

  useEffect(() => {
    console.log('rooms:', rooms);
  }, [rooms]);

  return rooms;
};

'use client';
import React, { useEffect, useState } from 'react';
import { getSession } from '@/actions';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';

interface Room {
  'room_id': number;
  'room_name': string;
  'host_id': number;
  'num_players': number;
  'max_players': number;
  'status': string;
  'created_at': string;
}

const Page = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      console.log('session', sessionData);
      if (!sessionData.isLogin) {
        router.push('/signin');
      } else {
        setSession(sessionData);
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('connected');
      newSocket.emit('get_rooms');
    });

    newSocket.on('rooms_data', (rooms: Room[]) => {
      setRooms(rooms);
      console.log('rooms', rooms);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = async (roomName: string, maxPlayers: number) => {
    if (!session) {
      console.error('Session not available');
      return;
    }

    const response = await fetch('http://127.0.0.1:5000/create_room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'room_name': roomName,
        'host_id': session.id,
        'max_players': maxPlayers,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Created room', data);
    }
    if (socket) {
      socket.emit('get_rooms');
    } else {
      console.error('Socket not connected');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName || !maxPlayers) {
      setError('Room name and max players are required');
      return;
    }

    const maxPlayersNumber = Number(maxPlayers);
    if (!Number.isInteger(maxPlayersNumber) || maxPlayersNumber < 3 || maxPlayersNumber > 12) {
      setError('Max players must be an integer between 3 and 12');
      return;
    }

    setError(null);

    if (roomName && maxPlayers) {
      createRoom(roomName, maxPlayers);
      setRoomName('');
      setMaxPlayers(3);
    }
  };

  return (
    <div>
      <h1>Rooms</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Max players"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value !== '' ? Number(e.target.value) : 3)}
          min="3"
          max="12"
          required
        />
        <button type="submit">Create room</button>
      </form>
      {error && <p>{error}</p>}
      <ul>
        {rooms.map((room) => (
          <li key={room.room_id}>
            {room.room_name} - {room.status} - {new Date(room.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;

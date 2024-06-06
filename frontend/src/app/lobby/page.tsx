'use client';
import React, { useEffect, useState } from 'react';
import { getSession } from '@/actions';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { Room } from '@mui/icons-material';
import RoomList from '@/components/roomList';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField'; 
import Button from '@mui/material/Button';

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
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      const room_id = data.room_res.room_id;
      router.push(`/lobby/${room_id}`);
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
      <Box className="my-4" component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
      <TextField
        label="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="bg-white"
        variant="outlined"
        required
   
      />
      <TextField
        label="Max players"
        value={maxPlayers}
        onChange={(e) => setMaxPlayers(e.target.value !== '' ? Number(e.target.value) : 3)}
        type="number"
        inputProps={{ min: 3, max: 12 }}
        className="bg-white"
        variant="outlined"
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Create room
      </Button>
    </Box>
      {error && <p>{error}</p>}
      <RoomList rooms={rooms} socket= {socket} />
    </div>
   
  );
};

export default Page;

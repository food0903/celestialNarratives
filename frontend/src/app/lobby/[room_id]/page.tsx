import React, {useState, useEffect} from 'react';
import io, { Socket } from 'socket.io-client';

interface Room {
    room_id: number;
    room_name: string;
    status: string;
    num_players: number;
    max_players: number;
    created_at: string;
    players: { id: number; name: string }[];
}

const RoomPage = ({params}: {
    params: {
        room_id: string;
    };
}) => {

  return (
    <div>
      this is room {params.room_id}
    </div>
  );
};

export default RoomPage;

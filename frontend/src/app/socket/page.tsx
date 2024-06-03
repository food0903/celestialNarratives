'use client';
import { useEffect, useState } from 'react';
import io, {Socket} from 'socket.io-client';

const socketInit = async () => {
    fetch('http://127.0.0.1:5000');
}

const page = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<String[]>([]);

    useEffect(() => {
        const newSocket = io('http://127.0.0.1:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('connected');
        });

        newSocket.on('message', (message: string) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return()=>{
            newSocket.close();
        }

    },[]);

    const sendMessage = () => {
        if(socket){
            socket.emit('message', message);
            setMessage('');
        }
    }


  return (
    <div>
      <h1> Socket communication</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
        <button onClick={sendMessage}>Send</button>
        <ul>
            {messages.map((message, index) => (
                <li key={index}>{message}</li>
            ))}
        </ul>
    </div>
  )
}

export default page

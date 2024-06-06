// 'use client';

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import io, { Socket } from 'socket.io-client';

// const SocketContext = createContext<Socket | null>(null);

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);

//   useEffect(() => {
//     const newSocket = io('http://127.0.0.1:5000');
//     setSocket(newSocket);

//     return () => {
//       newSocket.close();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

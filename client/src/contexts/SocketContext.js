import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL, {
        auth: { token }
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const socket = useContext(SocketContext);
  if (socket === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
} 
/*import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext=()=>{
    return useContext(SocketContext);
}

export const SocketContextProvider=({children})=>{
    const [socket , setSocket]= useState(null);
    const [onlineUser,setOnlineUser]=useState([]);
    const {authUser} = useAuth();
    useEffect(()=>{
        if(authUser){
            const socket = io("https://slrtech-chatapp.onrender.com/",{
                query:{
                    userId:authUser?._id,
                }
            })
            socket.on("getOnlineUsers",(users)=>{
                setOnlineUser(users)
            });
            setSocket(socket);
            return()=>socket.close();
        }else{
            if(socket){
                socket.close();
                setSocket(null); 
            }
        }
    },[authUser]);
    return(
    <SocketContext.Provider value={{socket , onlineUser}}>
        {children}
    </SocketContext.Provider>
    )
}/*
Part	Meaning
URL	Backend Socket.IO server
query.userId	Sends your user ID
io()	Opens live WebSocket


socket.handshake.query.userId    This userId is captured in backend here:
*/

/*

import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      // ✅ don't shadow state variable
const newSocket = io("https://chat-app-5-rizg.onrender.com", {
  query: { userId: authUser?._id },
});

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUser(users);
      });

      setSocket(newSocket);

      // ✅ proper cleanup
      return () => {
        newSocket.off("getOnlineUsers");
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
};*/



/*
export const SocketContextProvider=({children})=>{
    const [socket , setSocket]= useState(null);
    const [onlineUser,setOnlineUser]=useState([]);
    const {authUser} = useAuth();
 useEffect(() => {
  if (authUser) {
    const newSocket = io("https://chat-app-1-6v4y.onrender.com", {
      transports: ["websocket"],
      query: {
        userId: authUser._id,
      },
      withCredentials: true,
    });

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  } else {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }
}, [authUser]);

    return(
    <SocketContext.Provider value={{socket , onlineUser}}>
        {children}
    </SocketContext.Provider>
    )
}

*/

/*
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext=()=>{
    return useContext(SocketContext);
}

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const { authUser } = useAuth();
    
    useEffect(() => {
        if (authUser) {
            console.log('Connecting socket for user:', authUser._id);
            
            const newSocket = io("https://chat-app-1-6v4y.onrender.com", {
                transports: ["websocket"],
                query: {
                    userId: authUser._id,
                },
                withCredentials: true,
            });

            // Debug connection events
            newSocket.on("connect", () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on("disconnect", () => {
                console.log('Socket disconnected');
            });

            newSocket.on("connect_error", (error) => {
                console.error('Socket connection error:', error);
            });

 newSocket.on("getOnlineUsers", (users) => {
                console.log('Online users updated:', users);
                setOnlineUser(users);
            });

            // Debug message events
            newSocket.on("newMessage", (message) => {
                console.log('Received newMessage event:', message);
            });

            setSocket(newSocket);

            return () => {
                console.log('Disconnecting socket');
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUser }}>
            {children}
        </SocketContext.Provider>
    );
}
*/
/*
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  console.log("🔥 SocketContext Loaded");

  const { authUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);

  useEffect(() => {
    console.log("🔥 Socket useEffect running, user:", authUser);

    if (!authUser) {
      console.log("⚠️ No authUser → disconnecting socket");
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    
    const newSocket = io("https://chat-app-1-6v4y.onrender.com", {
     transports: ["websocket", "polling"] ,

      withCredentials: true,
      query: {
        userId: authUser._id,
      },
    });

    newSocket.on("connect", () => {
      console.log(" SOCKET CONNECTED:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.log(" SOCKET CONNECTION ERROR:", err);
    });

    newSocket.on("disconnect", () => {
      console.log("⚠️ SOCKET DISCONNECTED");
    });

    newSocket.on("getOnlineUsers", (users) => {
      console.log(" Online Users:", users);
      setOnlineUser(users);
    });

    newSocket.on("newMessage", (message) => {
      console.log("📩 NEW MESSAGE RECEIVED:", message);
    });

    setSocket(newSocket);

    return () => {
      console.log("⚠️ Cleanup → disconnecting socket");
      newSocket.disconnect();
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
};
*/



import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();
export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const { authUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);

  useEffect(() => {
    if (!authUser) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    // For single-service deployment: connect to same origin (production) or localhost (dev)
    const SOCKET_URL = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Try websocket first, fallback to polling
      withCredentials: true,
      query: {
        userId: authUser._id,
      },
    });

    newSocket.on("connect", () => {
      console.log("✅ SOCKET CONNECTED:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.log("❌ SOCKET ERROR:", err.message);
    });

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [authUser]);
  return (
    <SocketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
};

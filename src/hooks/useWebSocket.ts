// src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from "react";
import { apiConfig } from "../config/api.config";

interface WebSocketMessage {
  type: "QUEUE_UPDATE" | "TRACK_CHANGE" | "LISTENERS_UPDATE";
  data: any;
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(apiConfig.wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message", error);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      console.log("WebSocket connection closed", event);

      // Attempt to reconnect after a delay
      setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
      setIsConnected(false);
    };

    setSocket(ws);

    // Cleanup function
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
  };
};

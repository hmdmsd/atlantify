import { useState, useEffect, useCallback, useRef } from "react";
import { apiConfig } from "@/config/api.config";

// Enum for different message types
enum WebSocketMessageType {
  QUEUE_UPDATE = "QUEUE_UPDATE",
  TRACK_CHANGE = "TRACK_CHANGE",
  LISTENERS_UPDATE = "LISTENERS_UPDATE",
  RADIO_STATUS_CHANGE = "RADIO_STATUS_CHANGE",
  ERROR = "ERROR",
}

// Generic interface for WebSocket messages
interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
}

// Connection status types
type ConnectionStatus = "disconnected" | "connecting" | "connected";

export const useWebSocket = () => {
  // State management
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Refs for managing connection lifecycle
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  // Get authentication token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem("auth_token");
  }, []);

  // Create WebSocket connection
  const createWebSocket = useCallback(() => {
    // Clear any existing reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    // Clean up existing socket if it exists
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Get authentication token
    const token = getAuthToken();

    // Check if token exists
    if (!token) {
      console.log("No authentication token, skipping WebSocket connection");
      setConnectionStatus("disconnected");
      setConnectionError("No authentication token");
      return;
    }

    // Construct WebSocket URL with token
    const wsUrlWithToken = `${apiConfig.wsUrl}?token=${token}`;

    // Create new WebSocket connection
    const ws = new WebSocket(wsUrlWithToken);

    // Connection opened
    ws.onopen = () => {
      if (mountedRef.current) {
        setConnectionStatus("connected");
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        console.log("WebSocket connection established");
      }
    };

    // Incoming message handler
    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        // Validate message type
        if (Object.values(WebSocketMessageType).includes(message.type)) {
          if (mountedRef.current) {
            setLastMessage(message);
          }
        } else {
          console.warn("Received unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message", error);

        if (mountedRef.current) {
          setConnectionError("Failed to parse message");
        }
      }
    };

    // Connection closed
    ws.onclose = (event) => {
      if (mountedRef.current) {
        setConnectionStatus("disconnected");
        console.log("WebSocket connection closed", event);

        // Implement exponential backoff for reconnection
        const calculateDelay = () => {
          const baseDelay = 1000; // 1 second
          const maxDelay = 30000; // 30 seconds
          const attempts = reconnectAttemptsRef.current;

          // Exponential backoff with jitter
          const delay = Math.min(
            maxDelay,
            baseDelay * Math.pow(2, attempts) * (1 + Math.random())
          );

          reconnectAttemptsRef.current++;
          return delay;
        };

        // Schedule reconnection
        reconnectTimerRef.current = setTimeout(() => {
          createWebSocket();
        }, calculateDelay());
      }
    };

    // Connection error
    ws.onerror = (error) => {
      console.error("WebSocket error", error);

      if (mountedRef.current) {
        setConnectionStatus("disconnected");
        setConnectionError("WebSocket connection failed");
      }
    };

    // Save socket reference
    socketRef.current = ws;
  }, [getAuthToken]);

  // Effect for initial connection and cleanup
  useEffect(() => {
    mountedRef.current = true;
    createWebSocket();

    return () => {
      // Cleanup
      mountedRef.current = false;

      // Close socket
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Clear reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [createWebSocket]);

  // Method to send messages
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("Cannot send message: WebSocket not connected");
    }
  }, []);

  return {
    // Connection status
    isConnected: connectionStatus === "connected",
    connectionStatus,
    connectionError,

    // Message handling
    lastMessage,
    sendMessage,

    // Utility methods
    reconnect: createWebSocket,
  };
};

// Export message types for type-safe usage
export { WebSocketMessageType };

import { useEffect, useRef, useState, useCallback } from "react";

// Define progress stages for better type safety
export type ProgressStage =
  | "started"
  | "video-processing"
  | "extraction"
  | "verification";

export type FactCheckProgress = {
  type: "progress";
  stage: ProgressStage;
  statementIndex?: number; // Which statement is being processed (0-based)
  totalStatements?: number; // Total number of statements to check
  statements?: string[]; // Only on extraction_complete
  currentStatement?: string; // Current statement being verified
};

export type FactCheckResult = {
  statement: string;
  probability: string;
  reason: string;
  sources: string[];
};

export type FactCheckComplete = {
  type: "complete";
  results: FactCheckResult[];
};

export type FactCheckError = {
  type: "error";
  message: string;
};

// Add connection message type
export type ConnectionMessage = {
  type: "connection";
  client_id: string;
};

export type FactCheckMessage =
  | FactCheckProgress
  | FactCheckComplete
  | FactCheckError
  | ConnectionMessage;

export function useFactCheckWebSocket(initialClientId?: string) {
  const [connected, setConnected] = useState(false);
  const [clientId, setClientId] = useState<string | undefined>(initialClientId);
  const [progress, setProgress] = useState<FactCheckProgress | null>(null);
  const [results, setResults] = useState<FactCheckResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compose the WebSocket URL (replace http or https with ws or wss)
  const wsUrl = process.env.NEXT_PUBLIC_BACKEND_HOST
    ? `${process.env.NEXT_PUBLIC_BACKEND_HOST.replace(/^http:/, "ws:").replace(
        /^https:/,
        "wss:"
      )}/ws/fact-check/${clientId || "undefined"}`
    : `ws://localhost:8000/ws/fact-check/${clientId || "undefined"}`;

  // Log the WebSocket URL for debugging
  useEffect(() => {
    console.log("Connecting to WebSocket at:", wsUrl);
  }, [wsUrl]);

  // Function to establish WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new window.WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
      console.log("WebSocket connection established");
    };

    ws.onclose = (event) => {
      setConnected(false);
      console.log(`WebSocket closed with code: ${event.code}`);

      // Only attempt to reconnect if it wasn't a clean closure
      if (!event.wasClean) {
        const maxReconnectDelay = 30000; // 30 seconds max
        const baseDelay = 2000; // Start with 2 seconds
        const attempts = reconnectAttemptsRef.current;

        // Calculate delay with exponential backoff and some randomness
        const delay = Math.min(
          maxReconnectDelay,
          Math.floor(
            baseDelay * Math.pow(1.5, attempts) * (0.8 + Math.random() * 0.4)
          )
        );

        console.log(
          `WebSocket reconnecting in ${delay}ms (attempt ${attempts + 1})`
        );

        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      }
    };

    ws.onerror = (event) => {
      setError("WebSocket error");
      setConnected(false);
      console.error("WebSocket connection error for:", wsUrl, event);
      // Reconnection will be handled by onclose event
    };

    ws.onmessage = (event) => {
      try {
        const data: FactCheckMessage = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.type === "connection") {
          // Store the server-generated client ID if it's different
          if (data.client_id && data.client_id !== clientId) {
            console.log("Received server-generated client ID:", data.client_id);
            setClientId(data.client_id);
          }
        } else if (data.type === "progress") {
          setProgress(data as FactCheckProgress);
        } else if (data.type === "complete") {
          setResults((data as FactCheckComplete).results);
          setProgress(null);
        } else if (data.type === "error") {
          setError((data as FactCheckError).message);
        }
      } catch {
        setError("Invalid message from server");
      }
    };
  }, [wsUrl, clientId]);

  // Connect to WebSocket
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Send data to backend
  const sendFactCheck = useCallback((data: string) => {
    setProgress(null);
    setResults(null);
    setError(null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ data }));
    } else {
      setError("WebSocket is not connected. Please try again in a moment.");
    }
  }, []);

  return {
    connected,
    clientId, // Expose clientId
    progress,
    results,
    error,
    sendFactCheck,
  };
}

import { useEffect, useRef, useState, useCallback } from "react";

// Define progress stages for better type safety
export type ProgressStage =
  | "started"
  | "video-processing"
  | "extraction"
  | "extraction_complete"
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

export type FactCheckMessage =
  | FactCheckProgress
  | FactCheckComplete
  | FactCheckError;

export function useFactCheckWebSocket(clientId?: string) {
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState<FactCheckProgress | null>(null);
  const [results, setResults] = useState<FactCheckResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Compose the WebSocket URL
  const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_HOST?.replace(
    /^http/,
    "ws"
  )}/ws/fact-check/${clientId || "undefined"}`;

  // Log the WebSocket URL for debugging
  useEffect(() => {
    console.log("Connecting to WebSocket at:", wsUrl);
  }, [wsUrl]);

  // Connect to WebSocket
  useEffect(() => {
    const ws = new window.WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setError("WebSocket error");
      setConnected(false);
      console.error("WebSocket connection error for:", wsUrl);
    };

    ws.onmessage = (event) => {
      try {
        const data: FactCheckMessage = JSON.parse(event.data);
        if (data.type === "progress") {
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

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

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
    progress,
    results,
    error,
    sendFactCheck,
  };
}

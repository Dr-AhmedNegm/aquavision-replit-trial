import { useEffect, useState } from "react";
import { wsClient } from "@/lib/websocket";
import type { NetworkStatus, TrainingProgress } from "@shared/schema";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await wsClient.connect();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError('Failed to connect to server');
        setIsConnected(false);
      }
    };

    connect();

    // Set up event listeners
    wsClient.onNetworkStatus((status) => {
      setNetworkStatus(status);
    });

    wsClient.onTrainingProgress((progress) => {
      setTrainingProgress(progress);
    });

    wsClient.onError((err) => {
      setError(err.message || 'WebSocket error');
    });

    return () => {
      wsClient.disconnect();
    };
  }, []);

  return {
    isConnected,
    networkStatus,
    trainingProgress,
    error,
  };
}

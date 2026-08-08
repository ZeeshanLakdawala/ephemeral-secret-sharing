import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetRoomQueryKey, type Room } from "@workspace/api-client-react";

export function useRoomStream(code: string | undefined, participantId: string | undefined) {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(true);
  const [expirationReason, setExpirationReason] = useState<
    "host-ended" | "timer" | null
  >(null);

  useEffect(() => {
    if (!code || !participantId) return;

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${baseUrl}/api/rooms/${code}/events?participantId=${participantId}`;
    const es = new EventSource(url);

    es.onopen = () => {
      setIsConnecting(false);
    };

    es.addEventListener("state", (e) => {
      try {
        const room = JSON.parse(e.data) as Room;
        queryClient.setQueryData(getGetRoomQueryKey(code), room);
      } catch (err) {
        console.error("Failed to parse room state", err);
      }
    });

    es.addEventListener("expired", (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          reason?: "host-ended" | "timer";
        };
        setExpirationReason(payload.reason === "host-ended" ? "host-ended" : "timer");
      } catch {
        setExpirationReason("timer");
      }
      es.close();
    });

    es.onerror = () => {
      setIsConnecting(true);
    };

    return () => {
      es.close();
    };
  }, [code, participantId, queryClient]);

  return {
    isConnecting,
    isExpired: expirationReason !== null,
    expirationReason,
  };
}

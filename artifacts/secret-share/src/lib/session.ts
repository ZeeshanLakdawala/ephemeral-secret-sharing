import type { RoomSession } from "@workspace/api-client-react";

const PREFIX = "secret_share_room_";

export function saveRoomSession(code: string, session: RoomSession) {
  sessionStorage.setItem(PREFIX + code, JSON.stringify(session));
}

export function getRoomSession(code: string): RoomSession | null {
  const data = sessionStorage.getItem(PREFIX + code);
  if (!data) return null;
  try {
    return JSON.parse(data) as RoomSession;
  } catch {
    return null;
  }
}

export function clearRoomSession(code: string) {
  sessionStorage.removeItem(PREFIX + code);
}

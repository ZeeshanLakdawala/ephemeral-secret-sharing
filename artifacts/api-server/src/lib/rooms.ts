import { randomUUID, randomInt } from "node:crypto";
import { logger } from "./logger";

/**
 * In-memory store for ephemeral sharing rooms.
 *
 * Nothing here is persisted: rooms, secrets and participants live only in this
 * process and are destroyed permanently when the room lifetime elapses.
 */

export interface Secret {
  id: string;
  label: string;
  value: string;
  createdAt: Date;
}

export interface PublicRoom {
  code: string;
  expiresAt: Date;
  participantCount: number;
  secrets: Secret[];
}

interface Participant {
  id: string;
  name: string | null;
  /** Number of currently open event streams for this participant. */
  connections: number;
  lastSeenAt: number;
}

type Listener = (event: RoomEvent) => void;

export type RoomEvent =
  | { type: "state"; room: PublicRoom }
  | { type: "expired"; code: string };

interface Room {
  code: string;
  hostToken: string;
  hostParticipantId: string;
  createdAt: Date;
  expiresAt: Date;
  secrets: Secret[];
  participants: Map<string, Participant>;
  listeners: Set<Listener>;
  expiryTimer: NodeJS.Timeout;
}

export const DEFAULT_LIFETIME_MINUTES = 5;
export const MIN_LIFETIME_MINUTES = 1;
export const MAX_LIFETIME_MINUTES = 120;

/**
 * How long a participant with no open stream is still considered present.
 * This keeps the participant count stable across a browser refresh.
 */
const PRESENCE_GRACE_MS = 20_000;
const SWEEP_INTERVAL_MS = 5_000;

const rooms = new Map<string, Room>();

export class RoomError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RoomError";
  }
}

function generateRoomCode(): string {
  // Six digits, leading zeros allowed, never colliding with a live room.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    if (!rooms.has(code)) {
      return code;
    }
  }
  throw new RoomError(503, "Unable to allocate a room code, try again");
}

function isPresent(participant: Participant, now: number): boolean {
  return (
    participant.connections > 0 ||
    now - participant.lastSeenAt < PRESENCE_GRACE_MS
  );
}

function countParticipants(room: Room, now = Date.now()): number {
  let count = 0;
  for (const participant of room.participants.values()) {
    if (isPresent(participant, now)) {
      count += 1;
    }
  }
  return count;
}

export function toPublicRoom(room: Room): PublicRoom {
  return {
    code: room.code,
    expiresAt: room.expiresAt,
    participantCount: countParticipants(room),
    secrets: room.secrets.map((secret) => ({ ...secret })),
  };
}

function broadcastState(room: Room): void {
  const snapshot = toPublicRoom(room);
  for (const listener of room.listeners) {
    listener({ type: "state", room: snapshot });
  }
}

/**
 * Permanently destroys a room and everything inside it, notifying anyone still
 * connected so their client can return to the join screen.
 */
function expireRoom(room: Room): void {
  clearTimeout(room.expiryTimer);
  rooms.delete(room.code);

  const listeners = [...room.listeners];
  room.listeners.clear();
  room.secrets.length = 0;
  room.participants.clear();

  for (const listener of listeners) {
    listener({ type: "expired", code: room.code });
  }

  logger.info({ code: room.code }, "Room expired and was destroyed");
}

function getLiveRoom(code: string): Room {
  const room = rooms.get(code);
  if (!room) {
    throw new RoomError(404, "Room not found or already expired");
  }
  if (room.expiresAt.getTime() <= Date.now()) {
    expireRoom(room);
    throw new RoomError(404, "Room not found or already expired");
  }
  return room;
}

function assertHost(room: Room, hostToken: string): void {
  if (hostToken !== room.hostToken) {
    throw new RoomError(403, "Only the room host can manage secrets");
  }
}

export interface RoomSession extends PublicRoom {
  role: "host" | "participant";
  participantId: string;
  hostToken: string | null;
}

export function createRoom(lifetimeMinutes: number): RoomSession {
  const minutes = Math.min(
    MAX_LIFETIME_MINUTES,
    Math.max(MIN_LIFETIME_MINUTES, Math.round(lifetimeMinutes)),
  );

  const code = generateRoomCode();
  const now = Date.now();
  const hostParticipantId = randomUUID();

  const room: Room = {
    code,
    hostToken: randomUUID(),
    hostParticipantId,
    createdAt: new Date(now),
    expiresAt: new Date(now + minutes * 60_000),
    secrets: [],
    participants: new Map([
      [
        hostParticipantId,
        {
          id: hostParticipantId,
          name: "Host",
          connections: 0,
          lastSeenAt: now,
        },
      ],
    ]),
    listeners: new Set(),
    expiryTimer: setTimeout(() => {}, 0),
  };

  clearTimeout(room.expiryTimer);
  room.expiryTimer = setTimeout(() => expireRoom(room), minutes * 60_000);
  // Never keep the process alive purely for a pending room expiry.
  room.expiryTimer.unref?.();

  rooms.set(code, room);
  logger.info({ code, minutes }, "Room created");

  return {
    ...toPublicRoom(room),
    role: "host",
    participantId: hostParticipantId,
    hostToken: room.hostToken,
  };
}

export function getRoom(code: string): PublicRoom {
  return toPublicRoom(getLiveRoom(code));
}

export function joinRoom(code: string, name?: string): RoomSession {
  const room = getLiveRoom(code);
  const participantId = randomUUID();

  room.participants.set(participantId, {
    id: participantId,
    name: name ?? null,
    connections: 0,
    lastSeenAt: Date.now(),
  });

  broadcastState(room);

  return {
    ...toPublicRoom(room),
    role: "participant",
    participantId,
    hostToken: null,
  };
}

export function leaveRoom(code: string, participantId: string): void {
  const room = rooms.get(code);
  if (!room) {
    return;
  }
  if (room.participants.delete(participantId)) {
    broadcastState(room);
  }
}

export function addSecret(
  code: string,
  hostToken: string,
  label: string,
  value: string,
): Secret {
  const room = getLiveRoom(code);
  assertHost(room, hostToken);

  const secret: Secret = {
    id: randomUUID(),
    label,
    value,
    createdAt: new Date(),
  };

  room.secrets.push(secret);
  broadcastState(room);

  return { ...secret };
}

export function updateSecret(
  code: string,
  hostToken: string,
  secretId: string,
  label: string,
  value: string,
): Secret {
  const room = getLiveRoom(code);
  assertHost(room, hostToken);

  const secret = room.secrets.find((entry) => entry.id === secretId);
  if (!secret) {
    throw new RoomError(404, "Secret not found");
  }

  secret.label = label;
  secret.value = value;
  broadcastState(room);

  return { ...secret };
}

export function deleteSecret(
  code: string,
  hostToken: string,
  secretId: string,
): void {
  const room = getLiveRoom(code);
  assertHost(room, hostToken);

  const index = room.secrets.findIndex((entry) => entry.id === secretId);
  if (index === -1) {
    throw new RoomError(404, "Secret not found");
  }

  room.secrets.splice(index, 1);
  broadcastState(room);
}

/**
 * Registers an event stream. Holding a stream open is what marks a participant
 * as present, so the participant count follows real connections.
 */
export function subscribe(
  code: string,
  participantId: string | undefined,
  listener: Listener,
): () => void {
  const room = getLiveRoom(code);

  const participant = participantId
    ? room.participants.get(participantId)
    : undefined;

  if (participant) {
    participant.connections += 1;
    participant.lastSeenAt = Date.now();
  }

  room.listeners.add(listener);
  listener({ type: "state", room: toPublicRoom(room) });

  if (participant) {
    // Let everyone else see the updated presence count.
    broadcastState(room);
  }

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;

    room.listeners.delete(listener);

    if (participant) {
      participant.connections = Math.max(0, participant.connections - 1);
      participant.lastSeenAt = Date.now();
    }

    if (rooms.has(room.code)) {
      broadcastState(room);
    }
  };
}

/**
 * Safety net: expires overdue rooms even if a timer was missed, and drops
 * participants who disconnected and never came back.
 */
const sweepTimer = setInterval(() => {
  const now = Date.now();

  for (const room of [...rooms.values()]) {
    if (room.expiresAt.getTime() <= now) {
      expireRoom(room);
      continue;
    }

    let changed = false;
    for (const [id, participant] of room.participants) {
      if (!isPresent(participant, now)) {
        room.participants.delete(id);
        changed = true;
      }
    }

    if (changed) {
      broadcastState(room);
    }
  }
}, SWEEP_INTERVAL_MS);

sweepTimer.unref?.();

/** Exposed for tests and diagnostics only. */
export function activeRoomCount(): number {
  return rooms.size;
}

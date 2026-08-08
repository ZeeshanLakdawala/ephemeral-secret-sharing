import { Router, type IRouter } from "express";
import {
  CreateRoomBody,
  CreateRoomResponse,
  CreateSecretBody,
  CreateSecretParams,
  CreateSecretResponse,
  DeleteSecretBody,
  DeleteSecretParams,
  GetRoomParams,
  GetRoomResponse,
  JoinRoomBody,
  JoinRoomParams,
  JoinRoomResponse,
  LeaveRoomParams,
  UpdateSecretBody,
  UpdateSecretParams,
  UpdateSecretResponse,
} from "@workspace/api-zod";
import {
  RoomError,
  addSecret,
  createRoom,
  deleteSecret,
  getRoom,
  joinRoom,
  leaveRoom,
  subscribe,
  updateSecret,
  type RoomEvent,
} from "../lib/rooms";

const router: IRouter = Router();

function handleRoomError(
  error: unknown,
  res: import("express").Response,
): boolean {
  if (error instanceof RoomError) {
    res.status(error.status).json({ error: error.message });
    return true;
  }
  return false;
}

router.post("/rooms", (req, res): void => {
  const parsed = CreateRoomBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const session = createRoom(parsed.data.lifetimeMinutes);
    res.status(201).json(CreateRoomResponse.parse(session));
  } catch (error) {
    if (!handleRoomError(error, res)) {
      throw error;
    }
  }
});

router.get("/rooms/:code", (req, res): void => {
  const params = GetRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Room not found or already expired" });
    return;
  }

  try {
    res.json(GetRoomResponse.parse(getRoom(params.data.code)));
  } catch (error) {
    if (!handleRoomError(error, res)) {
      throw error;
    }
  }
});

router.post("/rooms/:code/join", (req, res): void => {
  const params = JoinRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Room not found or already expired" });
    return;
  }

  const body = JoinRoomBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const session = joinRoom(params.data.code, body.data.name);
    res.json(JoinRoomResponse.parse(session));
  } catch (error) {
    if (!handleRoomError(error, res)) {
      throw error;
    }
  }
});

router.delete("/rooms/:code/participants/:participantId", (req, res): void => {
  const params = LeaveRoomParams.safeParse(req.params);
  if (!params.success) {
    res.sendStatus(204);
    return;
  }

  leaveRoom(params.data.code, params.data.participantId);
  res.sendStatus(204);
});

router.post("/rooms/:code/secrets", (req, res): void => {
  const params = CreateSecretParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Room not found or already expired" });
    return;
  }

  const body = CreateSecretBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const secret = addSecret(
      params.data.code,
      body.data.hostToken,
      body.data.label,
      body.data.value,
    );
    res.status(201).json(CreateSecretResponse.parse(secret));
  } catch (error) {
    if (!handleRoomError(error, res)) {
      throw error;
    }
  }
});

router.patch("/rooms/:code/secrets/:secretId", (req, res): void => {
  const params = UpdateSecretParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Room not found or already expired" });
    return;
  }

  const body = UpdateSecretBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const secretId = String(req.params["secretId"]);

  try {
    const secret = updateSecret(
      params.data.code,
      body.data.hostToken,
      secretId,
      body.data.label,
      body.data.value,
    );
    res.json(UpdateSecretResponse.parse(secret));
  } catch (error) {
    if (!handleRoomError(error, res)) {
      throw error;
    }
  }
});

router.delete("/rooms/:code/secrets/:secretId", (req, res): void => {
  const params = DeleteSecretParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Room not found or already expired" });
    return;
  }

  const body = DeleteSecretBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const secretId = String(req.params["secretId"]);

  try {
    deleteSecret(params.data.code, body.data.hostToken, secretId);
    res.sendStatus(204);
  } catch (error) {
    if (!handleRoomError(error, res)) {
      throw error;
    }
  }
});

/**
 * Server-Sent Events stream carrying room state and the expiry notice.
 * Holding this stream open is what marks a participant as present.
 */
router.get("/rooms/:code/events", (req, res): void => {
  const params = GetRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Room not found or already expired" });
    return;
  }

  const rawParticipantId = req.query["participantId"];
  const participantId =
    typeof rawParticipantId === "string" && rawParticipantId.length > 0
      ? rawParticipantId
      : undefined;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (event: RoomEvent): void => {
    if (res.writableEnded) {
      return;
    }
    if (event.type === "state") {
      res.write(`event: state\ndata: ${JSON.stringify(event.room)}\n\n`);
      return;
    }
    res.write(
      `event: expired\ndata: ${JSON.stringify({
        code: event.code,
        reason: event.reason,
      })}\n\n`,
    );
    res.end();
  };

  let unsubscribe: (() => void) | undefined;

  try {
    unsubscribe = subscribe(params.data.code, participantId, send);
  } catch (error) {
    if (error instanceof RoomError) {
      // The stream is already open, so report expiry in-band and close.
      res.write(
        `event: expired\ndata: ${JSON.stringify({ code: params.data.code })}\n\n`,
      );
      res.end();
      return;
    }
    throw error;
  }

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(": keep-alive\n\n");
    }
  }, 15_000);
  heartbeat.unref?.();

  const cleanup = (): void => {
    clearInterval(heartbeat);
    unsubscribe?.();
  };

  req.on("close", cleanup);
  res.on("close", cleanup);
});

export default router;

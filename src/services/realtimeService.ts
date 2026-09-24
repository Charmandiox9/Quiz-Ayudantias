import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { LivePlayer, LiveQuestionPayload, LiveVotePayload, RealtimeEventName } from "../types";

interface RealtimeCallbacks {
  onConnected?: () => void;
  onPlayerJoin?: (player: LivePlayer & { id: string }) => void;
  onPlayerVote?: (vote: LiveVotePayload) => void;
  onGameState?: (state: Partial<import("../types").LiveGameState>) => void;
  onNextQuestion?: (data: LiveQuestionPayload) => void;
  onGameEnd?: (summary: Partial<import("../types").LiveGameState>) => void;
  onRoomClosed?: (payload: Record<string, unknown>) => void;
  onPresenceSync?: (players: LivePlayer[]) => void;
  onPlayerReject?: (payload: Record<string, unknown>) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isLivePlayer(value: unknown): value is LivePlayer {
  return isRecord(value) && typeof value.name === "string";
}

export class RealtimeQuizService {
  roomCode: string;
  channel: RealtimeChannel | null;
  isSubscribed: boolean;
  pendingEvents: Array<{ eventName: RealtimeEventName; payload: Record<string, unknown> }>;
  pendingTrack: LivePlayer | null;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.channel = null;
    this.isSubscribed = false;
    this.pendingEvents = [];
    this.pendingTrack = null;
  }

  subscribe({
    onConnected,
    onPlayerJoin,
    onPlayerVote,
    onGameState,
    onNextQuestion,
    onGameEnd,
    onRoomClosed,
    onPresenceSync,
    onPlayerReject,
  }: RealtimeCallbacks = {}): void {
    if (!isSupabaseConfigured || !supabase) {
      console.warn("Supabase no esta configurado. Modo local activado.");
      return;
    }

    const channelName = `quiz-room-${this.roomCode}`;
    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true, self: false },
        presence: { key: "" },
      },
    });

    if (onPlayerJoin) {
      this.channel.on("broadcast", { event: "player:join" }, ({ payload }: { payload: unknown }) => {
        if (isLivePlayer(payload) && typeof payload.id === "string") onPlayerJoin(payload as LivePlayer & { id: string });
      });
    }

    if (onPlayerVote) {
      this.channel.on("broadcast", { event: "player:vote" }, ({ payload }: { payload: unknown }) => {
        if (isRecord(payload) && typeof payload.playerName === "string") onPlayerVote(payload as unknown as LiveVotePayload);
      });
    }

    if (onGameState) {
      this.channel.on("broadcast", { event: "game:state" }, ({ payload }: { payload: unknown }) => {
        if (isRecord(payload)) onGameState(payload as unknown as Partial<import("../types").LiveGameState>);
      });
    }

    if (onNextQuestion) {
      this.channel.on("broadcast", { event: "game:next" }, ({ payload }: { payload: unknown }) => {
        if (isRecord(payload)) onNextQuestion(payload as unknown as LiveQuestionPayload);
      });
    }

    if (onGameEnd) {
      this.channel.on("broadcast", { event: "game:end" }, ({ payload }: { payload: unknown }) => {
        if (isRecord(payload)) onGameEnd(payload as unknown as Partial<import("../types").LiveGameState>);
      });
    }

    if (onRoomClosed) {
      this.channel.on("broadcast", { event: "game:closed" }, ({ payload }: { payload: unknown }) => {
        if (isRecord(payload)) onRoomClosed(payload);
      });
    }

    if (onPlayerReject) {
      this.channel.on("broadcast", { event: "player:reject" }, ({ payload }: { payload: unknown }) => {
        if (isRecord(payload)) onPlayerReject(payload);
      });
    }

    if (onPresenceSync) {
      this.channel.on("presence", { event: "sync" }, () => {
        const state = (this.channel ? this.channel.presenceState() : {}) as Record<string, unknown[]>;
        const activePlayers: LivePlayer[] = [];
        const seenNames = new Set();

        for (const key in state) {
          for (const item of state[key] || []) {
            if (isLivePlayer(item) && !seenNames.has(item.name)) {
              seenNames.add(item.name);
              activePlayers.push(item);
            }
          }
        }
        onPresenceSync(activePlayers);
      });
    }

    this.channel.subscribe(async (status: string) => {
      this.isSubscribed = status === "SUBSCRIBED";

      if (this.isSubscribed) {
        if (this.pendingTrack) {
          try {
            await this.channel!.track(this.pendingTrack);
          } catch (err) {
            console.error("Error al registrar presencia pendiente:", err);
          }
          this.pendingTrack = null;
        }

        while (this.pendingEvents.length > 0) {
          const pending = this.pendingEvents.shift();
          if (!pending) continue;
          const { eventName, payload } = pending;
          try {
            await this.channel!.send({
              type: "broadcast",
              event: eventName,
              payload,
            });
          } catch (err) {
            console.error("Error al vaciar evento en cola:", err);
          }
        }

        if (onConnected) {
          onConnected();
        }
      }
    });
  }

  async trackPresence(playerData: LivePlayer): Promise<void> {
    if (!this.channel || !this.isSubscribed) {
      this.pendingTrack = playerData;
      return;
    }
    try {
      await this.channel.track(playerData);
    } catch (err) {
      console.error("Error al registrar presencia:", err);
    }
  }

  getPresencePlayers() {
    if (!this.channel) return [];
    const state = this.channel.presenceState() as Record<string, unknown[]>;
    const activePlayers: LivePlayer[] = [];
    const seenNames = new Set();

    for (const key in state) {
      for (const item of state[key] || []) {
        if (isLivePlayer(item) && !seenNames.has(item.name)) {
          seenNames.add(item.name);
          activePlayers.push(item);
        }
      }
    }
    return activePlayers;
  }

  async broadcastEvent(eventName: RealtimeEventName, payload: Record<string, unknown>): Promise<boolean> {
    if (!this.channel || !this.isSubscribed) {
      this.pendingEvents.push({ eventName, payload });
      return true;
    }
    try {
      await this.channel.send({
        type: "broadcast",
        event: eventName,
        payload,
      });
      return true;
    } catch (err) {
      console.error("Error al emitir evento broadcast:", err);
      return false;
    }
  }

  broadcastJoin(player: LivePlayer & { id: string }): Promise<boolean> {
    return this.broadcastEvent("player:join", { ...player });
  }

  broadcastVote(votePayload: LiveVotePayload): Promise<boolean> {
    return this.broadcastEvent("player:vote", { ...votePayload });
  }

  broadcastState(statePayload: Record<string, unknown>): Promise<boolean> {
    return this.broadcastEvent("game:state", statePayload);
  }

  broadcastNext(nextPayload: LiveQuestionPayload): Promise<boolean> {
    return this.broadcastEvent("game:next", { ...nextPayload });
  }

  broadcastEnd(summaryPayload: Record<string, unknown>): Promise<boolean> {
    return this.broadcastEvent("game:end", summaryPayload);
  }

  broadcastRoomClosed(payload: Record<string, unknown> = {}): Promise<boolean> {
    return this.broadcastEvent("game:closed", payload);
  }

  broadcastReject(rejectPayload: Record<string, unknown>): Promise<boolean> {
    return this.broadcastEvent("player:reject", rejectPayload);
  }

  unsubscribe() {
    if (this.channel) {
      supabase?.removeChannel(this.channel);
      this.channel = null;
      this.isSubscribed = false;
      this.pendingEvents = [];
      this.pendingTrack = null;
    }
  }
}

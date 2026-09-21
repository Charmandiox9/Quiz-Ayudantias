import { supabase, isSupabaseConfigured } from "./supabaseClient";

export class RealtimeQuizService {
  constructor(roomCode) {
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
  } = {}) {
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
      this.channel.on("broadcast", { event: "player:join" }, ({ payload }) => {
        onPlayerJoin(payload);
      });
    }

    if (onPlayerVote) {
      this.channel.on("broadcast", { event: "player:vote" }, ({ payload }) => {
        onPlayerVote(payload);
      });
    }

    if (onGameState) {
      this.channel.on("broadcast", { event: "game:state" }, ({ payload }) => {
        onGameState(payload);
      });
    }

    if (onNextQuestion) {
      this.channel.on("broadcast", { event: "game:next" }, ({ payload }) => {
        onNextQuestion(payload);
      });
    }

    if (onGameEnd) {
      this.channel.on("broadcast", { event: "game:end" }, ({ payload }) => {
        onGameEnd(payload);
      });
    }

    if (onRoomClosed) {
      this.channel.on("broadcast", { event: "game:closed" }, ({ payload }) => {
        onRoomClosed(payload);
      });
    }

    if (onPlayerReject) {
      this.channel.on("broadcast", { event: "player:reject" }, ({ payload }) => {
        onPlayerReject(payload);
      });
    }

    if (onPresenceSync) {
      this.channel.on("presence", { event: "sync" }, () => {
        const state = this.channel ? this.channel.presenceState() : {};
        const activePlayers = [];
        const seenNames = new Set();

        for (const key in state) {
          for (const item of state[key]) {
            if (item && item.name && !seenNames.has(item.name)) {
              seenNames.add(item.name);
              activePlayers.push(item);
            }
          }
        }
        onPresenceSync(activePlayers);
      });
    }

    this.channel.subscribe(async (status) => {
      this.isSubscribed = status === "SUBSCRIBED";

      if (this.isSubscribed) {
        if (this.pendingTrack) {
          try {
            await this.channel.track(this.pendingTrack);
          } catch (err) {
            console.error("Error al registrar presencia pendiente:", err);
          }
          this.pendingTrack = null;
        }

        while (this.pendingEvents.length > 0) {
          const { eventName, payload } = this.pendingEvents.shift();
          try {
            await this.channel.send({
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

  async trackPresence(playerData) {
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
    const state = this.channel.presenceState();
    const activePlayers = [];
    const seenNames = new Set();

    for (const key in state) {
      for (const item of state[key]) {
        if (item && item.name && !seenNames.has(item.name)) {
          seenNames.add(item.name);
          activePlayers.push(item);
        }
      }
    }
    return activePlayers;
  }

  async broadcastEvent(eventName, payload) {
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

  broadcastJoin(player) {
    return this.broadcastEvent("player:join", player);
  }

  broadcastVote(votePayload) {
    return this.broadcastEvent("player:vote", votePayload);
  }

  broadcastState(statePayload) {
    return this.broadcastEvent("game:state", statePayload);
  }

  broadcastNext(nextPayload) {
    return this.broadcastEvent("game:next", nextPayload);
  }

  broadcastEnd(summaryPayload) {
    return this.broadcastEvent("game:end", summaryPayload);
  }

  broadcastRoomClosed(payload = {}) {
    return this.broadcastEvent("game:closed", payload);
  }

  broadcastReject(rejectPayload) {
    return this.broadcastEvent("player:reject", rejectPayload);
  }

  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isSubscribed = false;
      this.pendingEvents = [];
      this.pendingTrack = null;
    }
  }
}

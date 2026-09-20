import React, { useState } from "react";
import HubScreen from "./modes/HubScreen";
import HostScreen from "./modes/HostScreen";
import PlayerScreen from "./modes/PlayerScreen";
import SoloScreen from "./modes/SoloScreen";
import FastJoinScreen from "./modes/FastJoinScreen";
import { AYUDANTIAS, getAyudantiaById, getAyudantiaByCode } from "./data";
import {
  saveActiveSession,
  getActiveSession,
  clearActiveSession,
  getPlayerDeviceId,
} from "./utils/session";

function getInitialRoomCode() {
  if (typeof window !== "undefined" && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const joinRoom = params.get("join") || params.get("room") || "";
    return joinRoom.trim().toUpperCase();
  }
  return "";
}

function getInitialState() {
  const active = getActiveSession();
  if (active && active.role === "player" && active.name && active.roomCode) {
    const matchingAyudantia =
      (active.ayudantiaId && getAyudantiaById(active.ayudantiaId)) ||
      (active.roomCode && getAyudantiaByCode(active.roomCode)) ||
      AYUDANTIAS[0];

    return {
      view: "player",
      session: {
        name: active.name,
        roomCode: active.roomCode,
        playerId: active.playerId || getPlayerDeviceId(),
        ayudantia: matchingAyudantia,
      },
    };
  }

  return { view: "hub", session: null };
}

export default function App() {
  const [initial] = useState(getInitialState);
  const [currentView, setCurrentView] = useState(initial.view);
  const [sessionData, setSessionData] = useState(initial.session);
  const [initialRoomCode] = useState(getInitialRoomCode);
  const [showFullHub, setShowFullHub] = useState(false);

  const handleStartHost = ({ ayudantia, roomCode }) => {
    setSessionData({ ayudantia, roomCode });
    setCurrentView("host");
  };

  const handleJoinPlayer = ({ name, roomCode, ayudantia }) => {
    const playerId = getPlayerDeviceId();
    const session = { name, roomCode, ayudantia, playerId };

    saveActiveSession({
      name,
      roomCode,
      playerId,
      role: "player",
      ayudantiaId: ayudantia.id,
    });

    setSessionData(session);
    setCurrentView("player");
  };

  const handleStartSolo = ({ ayudantia }) => {
    setSessionData({ ayudantia });
    setCurrentView("solo");
  };

  const handleExitToHub = () => {
    clearActiveSession();
    setSessionData(null);
    setCurrentView("hub");
    setShowFullHub(true);
  };

  const isFastJoinTarget = initialRoomCode && !showFullHub && currentView === "hub";

  return (
    <div>
      {isFastJoinTarget && (
        <FastJoinScreen
          roomCode={initialRoomCode}
          onJoin={handleJoinPlayer}
          onGoToHub={() => setShowFullHub(true)}
        />
      )}

      {!isFastJoinTarget && currentView === "hub" && (
        <HubScreen
          onStartHost={handleStartHost}
          onJoinPlayer={handleJoinPlayer}
          onStartSolo={handleStartSolo}
          initialRoomCode={initialRoomCode}
        />
      )}

      {currentView === "host" && sessionData && (
        <HostScreen
          ayudantia={sessionData.ayudantia}
          roomCode={sessionData.roomCode}
          onExit={handleExitToHub}
        />
      )}

      {currentView === "player" && sessionData && (
        <PlayerScreen
          playerInfo={sessionData}
          onExit={handleExitToHub}
        />
      )}

      {currentView === "solo" && sessionData && (
        <SoloScreen
          ayudantia={sessionData.ayudantia}
          onExit={handleExitToHub}
        />
      )}
    </div>
  );
}

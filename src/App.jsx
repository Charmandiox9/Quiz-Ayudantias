import React, { useEffect, useRef, useState } from "react";
import { Toaster } from "sileo";
import HubScreen from "./modes/HubScreen";
import HostScreen from "./modes/HostScreen";
import PlayerScreen from "./modes/PlayerScreen";
import SoloScreen from "./modes/SoloScreen";
import FastJoinScreen from "./modes/FastJoinScreen";
import TeacherAccessScreen from "./modes/TeacherAccessScreen";
import { AYUDANTIAS, getAyudantiaById, getAyudantiaByCode } from "./data";
import { loadQuizCatalog } from "./data/quizCatalog";
import { isSupabaseConfigured, supabase } from "./services/supabaseClient";
import { hasTeacherAccess, loadPublicPracticeCatalog, loadTeacherCatalog, saveTeacherCatalog } from "./services/teacherCatalogService";
import {
  saveActiveSession,
  getActiveSession,
  clearActiveSession,
  getPlayerDeviceId,
} from "./utils/session";
import { getAppUrl } from "./utils/appUrl";

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

function freezeQuizSnapshot(quiz) {
  const snapshot = JSON.parse(JSON.stringify(quiz));
  const freezeDeep = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freezeDeep);
    return Object.freeze(value);
  };
  return freezeDeep(snapshot);
}

export default function App() {
  const [initial] = useState(getInitialState);
  const [currentView, setCurrentView] = useState(initial.view);
  const [sessionData, setSessionData] = useState(initial.session);
  const [initialRoomCode] = useState(getInitialRoomCode);
  const [showFullHub, setShowFullHub] = useState(false);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [teacherUser, setTeacherUser] = useState(null);
  const [teacherAllowed, setTeacherAllowed] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [publicCatalog, setPublicCatalog] = useState(null);
  const [publicCatalogError, setPublicCatalogError] = useState("");
  const [publicCatalogReloadKey, setPublicCatalogReloadKey] = useState(0);
  const [catalogError, setCatalogError] = useState("");
  const [accessNotice, setAccessNotice] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const [catalogReloadKey, setCatalogReloadKey] = useState(0);
  const teacherUserIdRef = useRef(null);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setCatalogError(error.message);
      const initialUser = data?.session?.user || null;
      teacherUserIdRef.current = initialUser?.id || null;
      setTeacherUser(initialUser);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      if (teacherUserIdRef.current !== (nextUser?.id || null)) {
        teacherUserIdRef.current = nextUser?.id || null;
        setTeacherAllowed(false);
        setCatalog(null);
        setTeacherUser(nextUser);
        if (!nextUser) setPublicCatalogReloadKey((key) => key + 1);
      }
      setAuthReady(true);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    loadPublicPracticeCatalog()
      .then((nextCatalog) => {
        if (active) setPublicCatalog(nextCatalog);
      })
      .catch((error) => {
        if (active) setPublicCatalogError(`No se pudieron cargar las prácticas: ${error.message}`);
      });
    return () => { active = false; };
  }, [publicCatalogReloadKey]);

  useEffect(() => {
    if (!isSupabaseConfigured || !teacherUser || currentView !== "hub") return undefined;
    let active = true;
    setCatalog(null);
    setCatalogError("");
    hasTeacherAccess(teacherUser.id)
      .then(async (allowed) => {
        if (!active) return;
        setTeacherAllowed(allowed);
        if (!allowed) {
          await supabase.auth.signOut();
          setAccessNotice("La cuenta no está habilitada para el espacio docente. Puedes unirte a una sala abajo.");
          return;
        }
        let remoteCatalog = await loadTeacherCatalog(teacherUser.id);
        if (remoteCatalog.subjects.length === 0) {
          const localCatalog = loadQuizCatalog();
          if (localCatalog.subjects.length) {
            await saveTeacherCatalog(localCatalog, teacherUser.id);
            remoteCatalog = await loadTeacherCatalog(teacherUser.id);
          }
        }
        if (active) setCatalog(remoteCatalog);
      })
      .catch((error) => {
        if (active) setCatalogError(`No se pudo cargar el catálogo: ${error.message}`);
      });
    return () => { active = false; };
  }, [teacherUser, currentView, catalogReloadKey]);

  const handleStartHost = ({ ayudantia, roomCode }) => {
    const quizSnapshot = freezeQuizSnapshot(ayudantia);
    setSessionData({ ayudantia: quizSnapshot, roomCode, quizVersion: quizSnapshot.version || 1 });
    setCurrentView("host");
  };

  const handleJoinPlayer = ({ name, roomCode, ayudantia }) => {
    const resolvedAyudantia = ayudantia || getAyudantiaByCode(roomCode) || AYUDANTIAS[0];
    const playerId = getPlayerDeviceId();
    const session = { name, roomCode, ayudantia: resolvedAyudantia, playerId };

    saveActiveSession({
      name,
      roomCode,
      playerId,
      role: "player",
      ayudantiaId: resolvedAyudantia.id,
    });

    setSessionData(session);
    setCurrentView("player");
  };

  const sendTeacherLink = async (email) => {
    if (!supabase) throw new Error("Supabase no está configurado.");
    setSendingLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getAppUrl(), shouldCreateUser: false },
      });
      if (error) throw error;
    } finally {
      setSendingLink(false);
    }
  };

  const handleSaveCatalog = async (nextCatalog) => {
    if (!teacherUser) throw new Error("La sesión docente expiró. Vuelve a entrar.");
    await saveTeacherCatalog(nextCatalog, teacherUser.id);
    setCatalog(nextCatalog);
    setPublicCatalogReloadKey((key) => key + 1);
  };

  const handleStartSolo = ({ ayudantia }) => {
    const quizSnapshot = freezeQuizSnapshot(ayudantia);
    setSessionData({ ayudantia: quizSnapshot, quizVersion: quizSnapshot.version || 1 });
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
      <Toaster position="top-right" theme="light" offset={20} />
      {isFastJoinTarget && (
        <FastJoinScreen
          roomCode={initialRoomCode}
          onJoin={handleJoinPlayer}
          onGoToHub={() => setShowFullHub(true)}
        />
      )}

      {!isFastJoinTarget && currentView === "hub" && isSupabaseConfigured && !authReady && (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F8FAFC", color: "#64748B" }}>Comprobando acceso…</main>
      )}

      {!isFastJoinTarget && currentView === "hub" && isSupabaseConfigured && authReady && (!teacherUser || !teacherAllowed) && (
        <TeacherAccessScreen
          onSendLink={sendTeacherLink}
          onJoinPlayer={handleJoinPlayer}
          busy={sendingLink}
          notice={accessNotice}
          errorNotice={catalogError}
          publicCatalog={publicCatalog}
          publicCatalogError={publicCatalogError}
          onStartSolo={handleStartSolo}
        />
      )}

      {!isFastJoinTarget && currentView === "hub" && (!isSupabaseConfigured || (teacherUser && teacherAllowed)) && (
        (isSupabaseConfigured && !catalog) ? (
          <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F8FAFC", color: "#64748B" }}>
            {catalogError ? (
              <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
                <p role="alert" style={{ color: "#B91C1C" }}>{catalogError}</p>
                <button type="button" onClick={() => setCatalogReloadKey((key) => key + 1)} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #CBD5E1", cursor: "pointer" }}>Reintentar</button>
              </div>
            ) : "Cargando asignaturas…"}
          </main>
        ) : (
        <HubScreen
          onStartHost={handleStartHost}
          onJoinPlayer={handleJoinPlayer}
          onStartSolo={handleStartSolo}
          initialRoomCode={initialRoomCode}
          catalog={isSupabaseConfigured ? catalog : undefined}
          onCatalogChange={isSupabaseConfigured ? handleSaveCatalog : undefined}
          teacherEmail={teacherUser?.email || ""}
          onSignOut={isSupabaseConfigured ? () => supabase.auth.signOut() : undefined}
        />
        )
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

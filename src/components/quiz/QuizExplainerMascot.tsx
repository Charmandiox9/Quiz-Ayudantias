import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { animateQuizMascot, createQuizMascotModel, disposeQuizMascotModel } from "../../three/createQuizMascotModel";

function plainText(value: string): string {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function selectSpanishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices.find((voice) => voice.lang.toLowerCase() === "es-cl")
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("es"))
    || null;
}

export default function QuizExplainerMascot({ explanation, correctAnswer }: { explanation: string; correctAnswer: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const speakingRef = useRef(false);
  const [speaking, setSpeaking] = useState(false);
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const narration = useMemo(() => plainText(`La respuesta correcta es ${correctAnswer}. ${explanation}`), [correctAnswer, explanation]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      mount.dataset.webglUnavailable = "true";
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-label", "Modelo 3D animado del personaje explicando la respuesta");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0.15, 2.15, 7.9);
    camera.lookAt(0.15, 1.85, 0);

    const model = createQuizMascotModel();
    model.scale.setScalar(0.88);
    model.position.x = -0.1;
    scene.add(model);

    const ambient = new THREE.HemisphereLight(0xfff4dc, 0x24304f, 2.0);
    const key = new THREE.DirectionalLight(0xffffff, 3.1);
    key.position.set(3.5, 6, 5);
    key.castShadow = true;
    const rim = new THREE.DirectionalLight(0xff934d, 1.5);
    rim.position.set(-4, 3, -4);
    scene.add(ambient, key, rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 48),
      new THREE.MeshStandardMaterial({ color: 0xdde7dc, transparent: true, opacity: 0.5, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0.04, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const animationStart = performance.now();
    let frameId = 0;
    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const render = () => {
      animateQuizMascot(model, (performance.now() - animationStart) / 1000, speakingRef.current, reducedMotion);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      disposeQuizMascotModel(model);
      ground.geometry.dispose();
      ground.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const finishNarration = useCallback(() => {
    speakingRef.current = false;
    setSpeaking(false);
  }, []);

  const stopNarration = useCallback(() => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    finishNarration();
  }, [finishNarration, speechSupported]);

  const speak = useCallback(() => {
    if (!speechSupported || !narration) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.lang = "es-CL";
    utterance.rate = 0.94;
    utterance.pitch = 1.04;
    const selectedVoice = selectSpanishVoice();
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => {
      speakingRef.current = true;
      setSpeaking(true);
    };
    utterance.onend = finishNarration;
    utterance.onerror = finishNarration;
    window.speechSynthesis.speak(utterance);
  }, [finishNarration, narration, speechSupported]);

  useEffect(() => {
    if (!speechSupported || !narration) return undefined;
    const timer = window.setTimeout(speak, 180);
    return () => {
      window.clearTimeout(timer);
      stopNarration();
    };
  }, [narration, speak, stopNarration, speechSupported]);

  return (
    <aside className="quiz-explainer-mascot" aria-label="Ayudante virtual de la explicación">
      <div ref={mountRef} className="quiz-explainer-mascot__canvas" />
      <div className="quiz-explainer-mascot__label">
        <span>{speaking ? "Explicando…" : "Ayudante 3D"}</span>
      </div>
    </aside>
  );
}

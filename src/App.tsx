import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw, Zap, Play, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Shard {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface TargetNode {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

// --- Procedural Sound Effects ---
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private musicStep: number = 0;

  constructor() {
    // Lazy initialized on first user tap
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  playPerfect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Chime synth note 1
    const osc1 = this.ctx.createOscillator();
    const gainNode1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
    gainNode1.gain.setValueAtTime(0.12, now);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc1.connect(gainNode1);
    gainNode1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Chime synth note 2 (harmonious fifth)
    const osc2 = this.ctx.createOscillator();
    const gainNode2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.03); // G5
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.18); // G6
    gainNode2.gain.setValueAtTime(0.08, now + 0.03);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc2.connect(gainNode2);
    gainNode2.connect(this.ctx.destination);
    osc2.start(now + 0.03);
    osc2.stop(now + 0.28);
  }

  playShatter() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Low synth bass drop
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    // High noise snap
    try {
      const bufferSize = this.ctx.sampleRate * 0.2; // 0.2 seconds of noise
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.2);
    } catch (e) {
      // Audio fallback
    }
  }

  playTurn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(329.63, now); // E4
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08); // A4

    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playBeat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Deep cyber kick drum beat
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();

    kickOsc.type = "triangle";
    kickOsc.frequency.setValueAtTime(120, now);
    kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.14);

    kickGain.gain.setValueAtTime(0.16, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    kickOsc.connect(kickGain);
    kickGain.connect(this.ctx.destination);

    kickOsc.start(now);
    kickOsc.stop(now + 0.14);

    // Harmonized pentatonic synth pulse
    const synthOsc = this.ctx.createOscillator();
    const synthGain = this.ctx.createGain();

    synthOsc.type = "sine";
    const pentatonicNotes = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63]; // C Pentatonic Scale
    const noteFreq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];

    synthOsc.frequency.setValueAtTime(noteFreq, now);
    synthGain.gain.setValueAtTime(0.04, now);
    synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    synthOsc.connect(synthGain);
    synthGain.connect(this.ctx.destination);

    synthOsc.start(now);
    synthOsc.stop(now + 0.22);
  }

  playStreakLost() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Descending 8-bit de-tune streak lost sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(220, now); // A3
    osc1.frequency.linearRampToValueAtTime(110, now + 0.4); // A2

    osc2.frequency.setValueAtTime(224, now); // Detuned
    osc2.frequency.linearRampToValueAtTime(112, now + 0.4);

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  startMusic() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.stopMusic();

    const stepTime = 220; // 8th notes at ~136 BPM
    this.musicInterval = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      this.musicStep = (this.musicStep + 1) % 16;

      // Soft high-hat rhythmic tick on every even step
      if (this.musicStep % 2 === 0) {
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();

        tickOsc.type = "triangle";
        tickOsc.frequency.setValueAtTime(7500, now);
        tickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.035);

        tickGain.gain.setValueAtTime(0.012, now);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        tickOsc.connect(tickGain);
        tickGain.connect(this.ctx.destination);

        tickOsc.start(now);
        tickOsc.stop(now + 0.035);
      }

      // Gentle pulsating cyber bass note every 8 steps
      if (this.musicStep % 8 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = "sine";
        const bassFreq = this.musicStep === 0 ? 55.00 : 65.41; // A1 or C2
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.045, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.25);
      }
    }, stepTime);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

// --- Constants ---
const NEON_COLORS = [
  "#00f3ff", // Cyan
  "#ff007f", // Pink
  "#39ff14", // Green
  "#ffe600", // Yellow
  "#b000ff", // Purple
  "#ff5e00", // Orange
];

const BASE_SPEED = 190; // Pixels per second
const MAX_SPEED = 480;
const SPEED_INC = 9;   // Speed increase per perfect hit
const PLAY_MARGIN = 40; // Screen boundary margin
const TRAIL_LENGTH = 200; // Visual length of line trail

// --- Helper Functions ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 243, b: 255 };
};

const getContrastingColor = (lineColor: string): string => {
  const filtered = NEON_COLORS.filter((c) => c !== lineColor);
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audio = useRef(new SoundManager());

  // --- React Game States for Overlays ---
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "SHATTERED">("START");
  const [gameMode, setGameMode] = useState<"CLASSIC" | "ZEN">(() => {
    try {
      return (localStorage.getItem("perfect_corner_mode") as "CLASSIC" | "ZEN") || "CLASSIC";
    } catch {
      return "CLASSIC";
    }
  });
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHowTo, setShowHowTo] = useState<boolean>(false);

  // --- Ref-based Engine Variables (to avoid re-renders at 60fps) ---
  const gameRef = useRef({
    head: { x: 0, y: 0 },
    dir: { dx: 1, dy: 0 },
    speed: BASE_SPEED,
    activeColor: NEON_COLORS[0],
    trail: [] as Point[],
    targetNode: null as TargetNode | null,
    particles: [] as Particle[],
    shards: [] as Shard[],
    floatingTexts: [] as FloatingText[],
    dimensions: { width: 0, height: 0 },
    gridOffset: { x: 0, y: 0 },
    screenShake: 0,
    screenFlash: 0,
    flashColor: "rgba(255, 0, 0, 0.25)",
    consecutivePerfects: 0,
    totalPerfects: 0,
    multiplier: 1,
    beatTriggered: false,
  });

  // Load highscore
  useEffect(() => {
    const saved = localStorage.getItem("perfect_corner_highscore");
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Set up high-DPI canvas & responsive resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      gameRef.current.dimensions = { width, height };

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Prevent pinch-zoom & default mobile touch behavior
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchstart", preventDefault, { passive: false });

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("touchstart", preventDefault);
    };
  }, []);

  // --- Spawning Target Nodes ---
  const spawnTargetNode = () => {
    const game = gameRef.current;
    const { width, height } = game.dimensions;
    const { x, y } = game.head;
    const { dx, dy } = game.dir;

    // Calculate distance to boundary along current trajectory
    let distToWall = 0;
    if (dx > 0) distToWall = width - PLAY_MARGIN - x;
    else if (dx < 0) distToWall = x - PLAY_MARGIN;
    else if (dy > 0) distToWall = height - PLAY_MARGIN - y;
    else if (dy < 0) distToWall = y - PLAY_MARGIN;

    // If we're too close to the wall, we shouldn't spawn a node here as it would clip or be too close to turn cleanly
    if (distToWall < 100) {
      game.targetNode = null;
      return;
    }

    // We want to spawn the node on the current segment, between 80px and the wall (with 35px padding)
    const minD = 80;
    const maxD = Math.max(minD + 10, distToWall - 35);
    const D = minD + Math.random() * (maxD - minD);

    const tx = x + dx * D;
    const ty = y + dy * D;

    game.targetNode = {
      x: tx,
      y: ty,
      dx,
      dy,
      color: getContrastingColor(game.activeColor),
    };
    game.beatTriggered = false;
  };

  // --- Reset/Start Game ---
  const startGame = () => {
    const game = gameRef.current;
    const { width, height } = game.dimensions;

    // Initial positioning in center moving right
    game.head = { x: width / 2, y: height / 2 };
    game.dir = { dx: 1, dy: 0 };
    game.speed = BASE_SPEED;
    game.activeColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    game.particles = [];
    game.shards = [];
    game.floatingTexts = [];
    game.screenShake = 0;
    game.screenFlash = 0;
    game.consecutivePerfects = 0;
    game.totalPerfects = 0;
    game.multiplier = 1;

    // Create a small initial trail
    game.trail = [];
    for (let i = 0; i < 15; i++) {
      game.trail.push({ x: width / 2 - i * 3, y: height / 2 });
    }

    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setGameState("PLAYING");

    // Spawn first target
    spawnTargetNode();
  };

  // --- Core Trigger: Screen Tap ---
  const handleAction = (e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
    }

    const game = gameRef.current;

    if (gameState === "START") {
      startGame();
      return;
    }

    if (gameState === "SHATTERED") {
      startGame();
      return;
    }

    if (gameState === "PLAYING" && game.targetNode) {
      const { x: tx, y: ty } = game.targetNode;
      const { x: hx, y: hy } = game.head;

      // Distance to target center
      const distance = Math.hypot(hx - tx, hy - ty);

      // PERFECT hit radius
      const hitRadius = 18;

      if (distance <= hitRadius) {
        // --- PERFECT HIT ---
        game.consecutivePerfects += 1;
        game.totalPerfects += 1;

        // Force head exactly to target node to make a perfect clean vertex
        game.head.x = tx;
        game.head.y = ty;

        // Push a clean point at the exact node corner to the trail
        game.trail.unshift({ x: tx, y: ty });

        // Calculate points based on the streak multiplier
        const currentMultiplier = game.multiplier;
        const pts = Math.round(100 * currentMultiplier);

        // Increase streak multiplier by 0.5x for the next hit
        game.multiplier += 0.5;

        const currentStreak = game.consecutivePerfects;

        setScore((prev) => prev + pts);
        setStreak(currentStreak);
        setMultiplier(game.multiplier);

        // Play chime and synchronized punchy beat together
        audio.current.playPerfect();
        audio.current.playBeat();
        game.beatTriggered = true;

        // Trigger Mobile Haptic feedback (50ms tap)
        if (navigator.vibrate) {
          navigator.vibrate(45);
        }

        // Speed ramp with curve
        game.speed = Math.min(MAX_SPEED, BASE_SPEED + currentStreak * SPEED_INC);

        // Turn 90 degrees randomly away from boundaries to keep path random and inside play area
        const { width, height } = game.dimensions;
        let newDx = 0;
        let newDy = 0;
        if (game.dir.dy === 0) {
          // Currently moving horizontally, must turn vertically (up or down)
          const spaceUp = ty - PLAY_MARGIN;
          const spaceDown = height - PLAY_MARGIN - ty;
          if (spaceUp > 120 && spaceDown > 120) {
            newDy = Math.random() < 0.5 ? 1 : -1;
          } else {
            newDy = spaceDown > spaceUp ? 1 : -1;
          }
        } else {
          // Currently moving vertically, must turn horizontally (left or right)
          const spaceLeft = tx - PLAY_MARGIN;
          const spaceRight = width - PLAY_MARGIN - tx;
          if (spaceLeft > 120 && spaceRight > 120) {
            newDx = Math.random() < 0.5 ? 1 : -1;
          } else {
            newDx = spaceRight > spaceLeft ? 1 : -1;
          }
        }

        game.dir.dx = newDx;
        game.dir.dy = newDy;

        // Spawn colorful neon spark particles
        const particleColor = game.targetNode.color;
        for (let i = 0; i < 18; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speedVal = 60 + Math.random() * 160;
          game.particles.push({
            x: tx,
            y: ty,
            vx: Math.cos(angle) * speedVal,
            vy: Math.sin(angle) * speedVal,
            radius: 1.5 + Math.random() * 2.5,
            color: particleColor,
            alpha: 1,
            life: 0,
            maxLife: 30 + Math.random() * 25,
          });
        }

        // Select a random exciting word other than perfect (such as excellent!)
        const HIT_WORDS = ["PERFECT!", "EXCELLENT!", "AMAZING!", "STELLAR!", "MARVELOUS!", "SUPERB!", "SPECTACULAR!", "INCREDIBLE!", "AWESOME!", "FLAWLESS!"];
        const randomWord = HIT_WORDS[Math.floor(Math.random() * HIT_WORDS.length)];

        // Spawn popup text showing score and current multiplier
        game.floatingTexts.push({
          x: tx,
          y: ty - 18,
          text: `${randomWord} +${pts} (${currentMultiplier.toFixed(1)}x)`,
          vy: -65,
          alpha: 1,
          size: 16 + Math.min(currentStreak, 8),
          color: particleColor,
          life: 0,
          maxLife: 45,
        });

        // Set line color to the target's node color
        game.activeColor = particleColor;

        // Spawn next target
        spawnTargetNode();
      } else {
        // --- SHATTER / MISSED TAP ---
        if (gameMode === "ZEN") {
          const currentStreak = game.consecutivePerfects;
          if (currentStreak > 0) {
            // Standout visual and audio streak loss
            triggerZenMiss();
          } else {
            // Minor feedback when already at 0 streak
            audio.current.playTurn();
            if (navigator.vibrate) {
              navigator.vibrate(30);
            }

            game.screenShake = 3;
            game.screenFlash = 0.22;
            game.flashColor = "rgba(255, 12, 60, 0.15)";

            // Calculate early/late based on dot product of direction and distance vector
            const dxToTarget = hx - tx;
            const dyToTarget = hy - ty;
            const dot = dxToTarget * game.targetNode.dx + dyToTarget * game.targetNode.dy;
            const label = dot > 0 ? "LATE!" : "EARLY!";

            game.floatingTexts.push({
              x: hx,
              y: hy - 18,
              text: label,
              vy: -55,
              alpha: 1,
              size: 14,
              color: "#ff007a",
              life: 0,
              maxLife: 40,
            });

            // If they tapped late (already passed the node), remove it and spawn a new one ahead
            if (dot > 0) {
              game.targetNode = null;
              spawnTargetNode();
            }
          }
        } else {
          triggerShatter();
        }
      }
    }
  };

  // --- Trigger Break/Shatter Game Over ---
  const triggerShatter = () => {
    const game = gameRef.current;
    setGameState("SHATTERED");

    audio.current.playShatter();

    // Reset multiplier to 1x
    game.multiplier = 1;
    setMultiplier(1);

    // Trigger Heavy Haptic
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }

    // Flash screen red/white
    game.screenFlash = 0.55;
    game.flashColor = "rgba(255, 12, 60, 0.35)";
    game.screenShake = 14;

    // Convert trailing line into shatter shards
    const segments = game.trail;
    for (let i = 0; i < segments.length - 1; i += 2) {
      const p1 = segments[i];
      const p2 = segments[i + 1];

      // Shatter shard physics properties
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      // Explosion velocities pushing shards outwards
      const vx = (Math.random() - 0.5) * 140 + (game.dir.dx * -30);
      const vy = (Math.random() - 0.5) * 140 - 50;

      game.shards.push({
        x1: p1.x - midX,
        y1: p1.y - midY,
        x2: p2.x - midX,
        y2: p2.y - midY,
        vx,
        vy,
        angle,
        vAngle: (Math.random() - 0.5) * 8,
        color: game.activeColor,
        alpha: 1.0,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    }

    // Add spark particle blast
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speedVal = 40 + Math.random() * 180;
      game.particles.push({
        x: game.head.x,
        y: game.head.y,
        vx: Math.cos(angle) * speedVal,
        vy: Math.sin(angle) * speedVal,
        radius: 1 + Math.random() * 3,
        color: game.activeColor,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 30,
      });
    }

    // Clear active path & targets
    game.trail = [];
    game.targetNode = null;

    // Handle high score
    setScore((prevScore) => {
      try {
        const saved = localStorage.getItem("perfect_corner_highscore");
        const currentHigh = saved ? parseInt(saved, 10) : 0;
        if (prevScore > currentHigh) {
          setHighScore(prevScore);
          localStorage.setItem("perfect_corner_highscore", prevScore.toString());
        }
      } catch (err) {
        console.error(err);
      }
      return prevScore;
    });
  };

  // --- Trigger Zen Miss (Standout visual/audio streak lost) ---
  const triggerZenMiss = () => {
    const game = gameRef.current;
    const currentStreak = game.consecutivePerfects;

    // Play standout powerdown / streak lost sound
    audio.current.playStreakLost();

    // Reset streak & multiplier
    game.consecutivePerfects = 0;
    setStreak(0);
    game.multiplier = 1;
    setMultiplier(1);

    // Haptic pattern for losing streak
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }

    // Heavy dramatic camera shake and screen flash (hot magenta/red)
    game.screenShake = 16;
    game.screenFlash = 0.65;
    game.flashColor = "rgba(255, 0, 110, 0.45)";

    const nodeX = game.targetNode ? game.targetNode.x : game.head.x;
    const nodeY = game.targetNode ? game.targetNode.y : game.head.y;

    // Spawn dramatic burst of dark-pink and red debris particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speedVal = 60 + Math.random() * 150;
      game.particles.push({
        x: nodeX,
        y: nodeY,
        vx: Math.cos(angle) * speedVal,
        vy: Math.sin(angle) * speedVal,
        radius: 2 + Math.random() * 3.5,
        color: "#ff007f", // hot neon pink
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 25,
      });
    }

    // Spawn a large, prominent, heavy downward-drifting floating text
    game.floatingTexts.push({
      x: nodeX,
      y: nodeY - 22,
      text: currentStreak > 0 ? "STREAK SHATTERED! 💔" : "MISS!",
      vy: 35, // drifts downwards heavily
      alpha: 1.0,
      size: 18,
      color: "#ff007f",
      life: 0,
      maxLife: 65,
    });

    // Clear active target node and spawn a new one on the current segment
    game.targetNode = null;
    spawnTargetNode();
  };

  // --- Main Animation Frame Engine ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;

    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      let dt = (timestamp - lastTime) / 1000;
      if (dt > 0.1) dt = 0.1; // Clamp lags
      lastTime = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext("2d");
      const game = gameRef.current;
      const { width, height } = game.dimensions;

      if (!ctx || width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // --- 1. Engine Logical Updates (Only if Playing) ---
      if (gameState === "PLAYING") {
        // Move line head forward
        game.head.x += game.dir.dx * game.speed * dt;
        game.head.y += game.dir.dy * game.speed * dt;

        // Push new head point to front of trail
        game.trail.unshift({ x: game.head.x, y: game.head.y });

        // Maintain precise physical trail limits based on length
        const maxPoints = Math.max(25, Math.round(TRAIL_LENGTH / (game.speed * 0.016)));
        if (game.trail.length > maxPoints) {
          game.trail.pop();
        }

        // Auto Turn boundaries check
        let autoTurned = false;
        if (game.dir.dx > 0 && game.head.x >= width - PLAY_MARGIN) {
          game.head.x = width - PLAY_MARGIN;
          const turnDown = game.head.y - PLAY_MARGIN < height - PLAY_MARGIN - game.head.y;
          game.dir.dy = turnDown ? 1 : -1;
          game.dir.dx = 0;
          autoTurned = true;
        } else if (game.dir.dx < 0 && game.head.x <= PLAY_MARGIN) {
          game.head.x = PLAY_MARGIN;
          const turnDown = game.head.y - PLAY_MARGIN < height - PLAY_MARGIN - game.head.y;
          game.dir.dy = turnDown ? 1 : -1;
          game.dir.dx = 0;
          autoTurned = true;
        } else if (game.dir.dy > 0 && game.head.y >= height - PLAY_MARGIN) {
          game.head.y = height - PLAY_MARGIN;
          const turnRight = game.head.x - PLAY_MARGIN < width - PLAY_MARGIN - game.head.x;
          game.dir.dx = turnRight ? 1 : -1;
          game.dir.dy = 0;
          autoTurned = true;
        } else if (game.dir.dy < 0 && game.head.y <= PLAY_MARGIN) {
          game.head.y = PLAY_MARGIN;
          const turnRight = game.head.x - PLAY_MARGIN < width - PLAY_MARGIN - game.head.x;
          game.dir.dx = turnRight ? 1 : -1;
          game.dir.dy = 0;
          autoTurned = true;
        }

        if (autoTurned) {
          audio.current.playTurn();
          // Lock turning vertex in trail to ensure 100% sharp corner render
          game.trail[0] = { x: game.head.x, y: game.head.y };

          if (!game.targetNode) {
            spawnTargetNode();
          }
        }

        // Check if head has passed the active Target Node without a tap
        if (game.targetNode) {
          const dxToTarget = game.head.x - game.targetNode.x;
          const dyToTarget = game.head.y - game.targetNode.y;
          // Dot product tells us if the head is moving away/past the target node along its spawn direction
          const dot = dxToTarget * game.targetNode.dx + dyToTarget * game.targetNode.dy;

          // Play the synchronized beat at the exact millisecond the head crosses the node
          if (dot >= 0 && !game.beatTriggered) {
            game.beatTriggered = true;
            audio.current.playBeat();
          }

          // If passed target by more than 16px, handle miss
          if (dot > 16) {
            if (gameMode === "ZEN") {
              const currentStreak = game.consecutivePerfects;
              if (currentStreak > 0) {
                // Standout visual and audio streak loss
                triggerZenMiss();
              } else {
                // Minor feedback since streak is already at 0
                audio.current.playTurn();
                game.screenShake = 2;
                game.screenFlash = 0.15;
                game.flashColor = "rgba(255, 12, 60, 0.1)";

                game.floatingTexts.push({
                  x: game.targetNode.x,
                  y: game.targetNode.y - 18,
                  text: "MISS!",
                  vy: -55,
                  alpha: 1,
                  size: 14,
                  color: "#ff007a",
                  life: 0,
                  maxLife: 40,
                });

                game.targetNode = null;
                spawnTargetNode();
              }
            } else {
              triggerShatter();
            }
          }
        }
      }

      // --- 2. Particles & FX Physics Updates ---
      // Update Sparks
      game.particles = game.particles.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 80 * dt; // faint gravity on sparks
        p.vx *= Math.pow(0.96, dt * 60); // friction
        p.vy *= Math.pow(0.96, dt * 60);
        p.life += dt * 60;
        p.alpha = 1 - p.life / p.maxLife;
        return p.life < p.maxLife;
      });

      // Update Shatter Shards
      game.shards = game.shards.filter((s) => {
        s.vx *= Math.pow(0.97, dt * 60);
        s.vy += 180 * dt; // Gravity
        s.x1 += s.vx * dt;
        s.y1 += s.vy * dt;
        s.x2 += s.vx * dt;
        s.y2 += s.vy * dt;
        s.angle += s.vAngle * dt;
        s.life += dt * 60;
        s.alpha = 1 - s.life / s.maxLife;
        return s.life < s.maxLife;
      });

      // Update Floating popups
      game.floatingTexts = game.floatingTexts.filter((t) => {
        t.y += t.vy * dt;
        t.life += dt * 60;
        t.alpha = 1 - t.life / t.maxLife;
        return t.life < t.maxLife;
      });

      // Slowly drift cyber grid background
      game.gridOffset.x = (game.gridOffset.x + 12 * dt) % 40;
      game.gridOffset.y = (game.gridOffset.y + 8 * dt) % 40;

      // Decay screen effects
      if (game.screenShake > 0) {
        game.screenShake *= Math.pow(0.85, dt * 60);
        if (game.screenShake < 0.1) game.screenShake = 0;
      }
      if (game.screenFlash > 0) {
        game.screenFlash -= 1.8 * dt;
        if (game.screenFlash < 0) game.screenFlash = 0;
      }

      // --- 3. Render Pipeline ---
      ctx.clearRect(0, 0, width, height);

      // Camera Shake translate
      ctx.save();
      if (game.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * game.screenShake;
        const shakeY = (Math.random() - 0.5) * game.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Draw cyber Grid Background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      const startX = game.gridOffset.x;
      for (let x = startX - gridSize; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      const startY = game.gridOffset.y;
      for (let y = startY - gridSize; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Arena Borders (Thin neon glow boundaries)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.strokeRect(
        PLAY_MARGIN,
        PLAY_MARGIN,
        width - PLAY_MARGIN * 2,
        height - PLAY_MARGIN * 2
      );
      ctx.setLineDash([]); // Reset line dash

      // Draw Target Node (Pulse and ring glows)
      if (game.targetNode) {
        const node = game.targetNode;
        const pulse = Math.sin(timestamp * 0.007) * 0.12 + 1.0;
        const outerRad = 17 * pulse;

        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = node.color;

        // Pulse ring
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, outerRad, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing core halo
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.12;
        ctx.beginPath();
        ctx.arc(node.x, node.y, outerRad + 10, 0, Math.PI * 2);
        ctx.fill();

        // Solid center core dot
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Draw Path Trail
      if (gameState === "PLAYING" && game.trail.length >= 2) {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 14;
        ctx.shadowColor = game.activeColor;

        const rgb = hexToRgb(game.activeColor);

        // Render trail backwards, fading older segments to transparency
        for (let i = 0; i < game.trail.length - 1; i++) {
          const p1 = game.trail[i];
          const p2 = game.trail[i + 1];
          const opacity = 1 - i / game.trail.length;

          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();

        // Bright Neon Cap/Head
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = game.activeColor;
        ctx.beginPath();
        ctx.arc(game.head.x, game.head.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Sparks Particles
      game.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Physical Shatter Shards (Game over state)
      game.shards.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;

        // Apply translations around center point
        const midX = (s.x1 + s.x2) / 2;
        const midY = (s.y1 + s.y2) / 2;
        ctx.translate(midX, midY);
        ctx.rotate(s.angle);

        ctx.beginPath();
        ctx.moveTo(s.x1 - midX, s.y1 - midY);
        ctx.lineTo(s.x2 - midX, s.y2 - midY);
        ctx.stroke();

        ctx.restore();
      });

      // Draw Floating Popups Text
      game.floatingTexts.forEach((t) => {
        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = `800 ${t.size}px "Outfit", sans-serif`;
        ctx.textAlign = "center";
        ctx.shadowBlur = 12;
        ctx.shadowColor = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      ctx.restore(); // Restore from shake translate

      // Draw screen overlay flash
      if (game.screenFlash > 0) {
        ctx.save();
        ctx.fillStyle = game.flashColor;
        ctx.globalAlpha = game.screenFlash;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, gameMode]);

  // Synchronize background music with game state
  useEffect(() => {
    if (gameState === "PLAYING") {
      audio.current.startMusic();
    } else {
      audio.current.stopMusic();
    }
    return () => {
      audio.current.stopMusic();
    };
  }, [gameState]);

  // Handle mute toggling
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering gameplay tap
    const muted = audio.current.toggleMute();
    setIsMuted(muted);
    if (muted) {
      audio.current.stopMusic();
    } else if (gameState === "PLAYING") {
      audio.current.startMusic();
    }
  };

  return (
    <div
      id="game-root"
      className="relative flex items-center justify-center min-h-[100dvh] w-full bg-[#020202] text-white font-sans overflow-hidden select-none"
    >
      {/* Decorative branding on the left for wide desktop viewports */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none select-none z-0">
        <h2 className="text-[100px] font-black tracking-tighter opacity-10 leading-none uppercase">
          PERFECT<br />CORNER
        </h2>
        <p className="mt-4 font-mono text-sm tracking-[0.3em] text-cyan-400 opacity-40 uppercase">
          RHYTHM-TIMING PRECISION
        </p>
      </div>

      {/* Decorative tagline on the right for wide desktop viewports */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none select-none text-right z-0">
        <h2 className="text-xl font-black tracking-widest text-[#FF007A] opacity-30 uppercase">
          DOOMSCROLL OUT
        </h2>
        <p className="mt-2 font-mono text-xs tracking-wider text-white opacity-20">
          TAP ON THE EXACT MILLISECOND
        </p>
      </div>

      {/* Main responsive phone-frame device container */}
      <div
        id="device-frame"
        className="relative w-full h-[100dvh] md:w-[432px] md:h-[768px] bg-[#050505] md:border-[12px] md:border-[#111] md:rounded-[60px] md:shadow-[0_0_100px_rgba(0,240,255,0.12)] overflow-hidden flex flex-col justify-between select-none touch-none z-10"
        onPointerDown={(e) => handleAction(e)}
      >
        {/* Absolute Full Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Top phone notch capsule decoration */}
        <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full items-center justify-center z-30 pointer-events-none">
          <div className="w-8 h-1 bg-zinc-800 rounded-full" />
        </div>

        {/* Top Header / HUD */}
        <div className="absolute top-0 inset-x-0 p-6 flex flex-col pointer-events-none z-10">
          {/* Controls Bar */}
          <div className="flex justify-between items-center pointer-events-auto">
            {/* Minimalist Controls */}
            <div className="flex gap-2 items-center">
              <button
                id="btn-mute"
                onClick={handleToggleMute}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-transform backdrop-blur-sm shadow-md cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                id="btn-help"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHowTo(true);
                }}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-transform backdrop-blur-sm shadow-md cursor-pointer"
                title="How to Play"
              >
                <HelpCircle size={15} />
              </button>

              <button
                id="btn-mode"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextMode = gameMode === "CLASSIC" ? "ZEN" : "CLASSIC";
                  setGameMode(nextMode);
                  try { localStorage.setItem("perfect_corner_mode", nextMode); } catch (err) {}
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`ml-1 h-9 px-3 rounded-full text-[9px] font-mono tracking-widest uppercase font-black transition-all cursor-pointer border flex items-center justify-center ${
                  gameMode === "CLASSIC"
                    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/25 active:scale-95"
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/25 active:scale-95"
                }`}
                title="Toggle Game Mode"
              >
                {gameMode}
              </button>
            </div>

            {/* Top High Score badge */}
            {highScore > 0 && (
              <div className="px-2.5 py-1 rounded-md bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-mono text-[9px] tracking-widest uppercase">
                BEST: {highScore}
              </div>
            )}
          </div>

          {/* Bold Score Tracker (Only visible while playing) */}
          {gameState === "PLAYING" && (
            <div className="flex justify-between items-end mt-5">
              {/* Left Score Block */}
              <div className="flex flex-col">
                <span className="text-[#00F0FF] font-mono text-[9px] tracking-widest uppercase opacity-70">
                  SCORE
                </span>
                <span className="text-3xl font-black tracking-tighter text-white leading-none">
                  {score.toLocaleString()}
                </span>
              </div>

              {/* Center Multiplier Block */}
              <div className="flex flex-col items-center">
                <span className="text-yellow-400 font-mono text-[9px] tracking-widest uppercase opacity-70">
                  MULTIPLIER
                </span>
                <motion.span
                  key={multiplier}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-black tracking-tighter text-yellow-400 leading-none drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                >
                  {multiplier.toFixed(1)}x
                </motion.span>
              </div>

              {/* Right Streak Block */}
              <div className="flex flex-col items-end">
                <span className="text-[#FF007A] font-mono text-[9px] tracking-widest uppercase opacity-70">
                  STREAK
                </span>
                <span className="text-3xl font-black tracking-tighter italic text-[#FF007A] leading-none flex items-center gap-0.5">
                  <Zap size={14} className="fill-[#FF007A] text-[#FF007A]" />
                  {streak}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Instructional Guide at the bottom while playing */}
        {gameState === "PLAYING" && (
          <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-2 pointer-events-none opacity-30">
            <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full animate-ping" />
            </div>
            <p className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/50">TAP ANYWHERE TO TURN</p>
          </div>
        )}

        {/* --- Overlay screens --- */}
        <AnimatePresence>
          {/* 1. Start Screen */}
          {gameState === "START" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-between p-8 bg-gradient-to-t from-black via-black/95 to-black/60 z-20"
            >
              {/* Top decorative space */}
              <div />

              {/* Title Block */}
              <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                <div className="relative mb-6 transform -rotate-6">
                  {/* Visual pulse glow backing the title */}
                  <div className="absolute -inset-4 bg-cyan-500/10 blur-xl rounded-full animate-pulse" />
                  <h1 className="text-6xl font-black leading-none tracking-tighter text-white drop-shadow-[0_0_35px_rgba(0,240,255,0.6)] uppercase">
                    PERFECT<br />CORNER
                  </h1>
                  <div className="bg-[#FFF500] text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] mt-2 inline-block">
                    RHYTHM-TIMING PRECISION
                  </div>
                </div>

                <p className="text-xs text-white/50 font-mono tracking-wide leading-relaxed max-w-[280px] mt-2">
                  A minimalist, fast-paced timing arcade. Focus, tap, and turn perfectly.
                </p>
              </div>

              {/* Action Box */}
              <div className="flex flex-col items-center gap-6 pb-12">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  className="flex items-center gap-2 text-cyan-400 text-sm font-black font-mono tracking-wider"
                >
                  <Play size={14} className="fill-cyan-400" />
                  TAP ANYWHERE TO PLAY
                </motion.div>

                {/* Futurist Mode Selector Pill */}
                <div 
                  className="flex bg-white/5 p-1 rounded-full border border-white/10 relative z-30"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setGameMode("CLASSIC");
                      try { localStorage.setItem("perfect_corner_mode", "CLASSIC"); } catch (e) {}
                    }}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-black tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                      gameMode === "CLASSIC"
                        ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    CLASSIC
                  </button>
                  <button
                    onClick={() => {
                      setGameMode("ZEN");
                      try { localStorage.setItem("perfect_corner_mode", "ZEN"); } catch (e) {}
                    }}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-black tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                      gameMode === "ZEN"
                        ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    ZEN MODE
                  </button>
                </div>

                {highScore > 0 && (
                  <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center gap-0.5">
                    <span className="text-[9px] tracking-widest text-white/40 font-mono uppercase">
                      BEST RECORD
                    </span>
                    <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                      {highScore.toLocaleString()} PTS
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. Shattered (Game Over) Screen */}
          {gameState === "SHATTERED" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-between p-8 bg-black/90 backdrop-blur-[2px] z-20"
            >
              {/* Top space */}
              <div />

              {/* Score Summary Box */}
              <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="mb-8 transform -rotate-3"
                >
                  <h1 className="text-5xl font-black leading-none tracking-tighter text-[#FF007A] drop-shadow-[0_0_25px_rgba(255,0,122,0.6)] uppercase">
                    SHATTERED
                  </h1>
                  <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] mt-2 inline-block">
                    GAME OVER
                  </div>
                </motion.div>

                {/* Score Display Card */}
                <div className="w-full p-6 rounded-2xl bg-[#09090c]/90 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                      FINAL SCORE
                    </span>
                    <span className="text-3xl font-black text-white tracking-tighter">
                      {score.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                      MAX STREAK
                    </span>
                    <span className="text-xl font-black text-[#FF007A] tracking-tighter italic flex items-center gap-1">
                      <Zap size={14} className="fill-[#FF007A]" />
                      x{streak}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                      HIGH SCORE
                    </span>
                    <span className="text-lg font-bold text-cyan-400 tracking-tight">
                      {highScore.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tap to Retry Action */}
              <div className="flex flex-col items-center gap-4 pb-12">
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="flex items-center gap-2 text-cyan-400 text-sm font-black font-mono tracking-wider"
                >
                  <RotateCcw size={14} />
                  TAP ANYWHERE TO RETRY
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* 3. "How to Play" Overlay Modal */}
          {showHowTo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex items-center justify-center p-6 animate-none"
              onClick={(e) => {
                e.stopPropagation();
                setShowHowTo(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-[#09090c]/95 border border-white/10 p-6 rounded-2xl flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 uppercase">
                  <HelpCircle className="text-cyan-400" />
                  HOW TO PLAY
                </h3>

                <div className="flex flex-col gap-4 text-xs text-white/70 font-mono leading-relaxed">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-xs">
                      1
                    </div>
                    <p>
                      A single neon line draws itself forward. It automatically makes a clean, sharp 90-degree turn whenever you successfully tap a target node.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold font-mono text-xs">
                      2
                    </div>
                    <p>
                      A target node spawns on the upcoming path.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold font-mono text-xs">
                      3
                    </div>
                    <p>
                      <strong className="text-white font-black">TAP</strong> on the exact millisecond the tip centers in the node to turn, earn points, and increase your score multiplier by 0.5x.
                    </p>
                  </div>

                  <div className="flex gap-3 border-t border-white/5 pt-4 mt-1">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold font-mono text-xs">
                      !
                    </div>
                    <p className="text-red-300">
                      In <strong className="text-white">Classic Mode</strong>, any miss shatters the line. In <strong className="text-white">Zen Mode</strong>, misses only reset your streak/multiplier, allowing you to play endlessly without losing!
                    </p>
                  </div>
                </div>

                <button
                  id="btn-close-help"
                  onClick={() => setShowHowTo(false)}
                  className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 active:scale-95 transition-transform text-cyan-400 font-extrabold tracking-wider font-mono text-xs cursor-pointer"
                >
                  GOT IT
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

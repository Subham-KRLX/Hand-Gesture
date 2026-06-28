import {
  FilesetResolver,
  HandLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/vision_bundle.mjs";

const video = document.querySelector("#video");
const drawCanvas = document.querySelector("#drawCanvas");
const guideCanvas = document.querySelector("#guideCanvas");
const drawCtx = drawCanvas.getContext("2d", { alpha: true });
const guideCtx = guideCanvas.getContext("2d", { alpha: true });
const startScreen = document.querySelector("#startScreen");
const startBtn = document.querySelector("#startBtn");
const cameraStatus = document.querySelector("#cameraStatus");
const cameraPulse = document.querySelector("#cameraPulse");
const gestureStatus = document.querySelector("#gestureStatus");
const pinchMeter = document.querySelector("#pinchMeter");
const stabilityReadout = document.querySelector("#stabilityReadout");
const penBtn = document.querySelector("#penBtn");
const eraserBtn = document.querySelector("#eraserBtn");
const clearBtn = document.querySelector("#clearBtn");
const saveBtn = document.querySelector("#saveBtn");
const brushSize = document.querySelector("#brushSize");
const stabilizer = document.querySelector("#stabilizer");
const precisionMode = document.querySelector("#precisionMode");
const sizeDot = document.querySelector("#sizeDot");
const colorButtons = [...document.querySelectorAll(".color-btn")];

const state = {
  color: "#20f7b2",
  size: 14,
  smoothing: 0.72,
  mode: "pen",
  lastPoint: null,
  lastDrawPoint: null,
  pinchActive: false,
  landmarker: null,
  running: false,
  lastVideoTime: -1,
};

const setStatus = (text, ready = false) => {
  cameraStatus.textContent = text;
  cameraPulse.classList.toggle("ready", ready);
};

const resizeCanvases = () => {
  const dpr = window.devicePixelRatio || 1;
  const rect = drawCanvas.getBoundingClientRect();
  const oldWidth = drawCanvas.width;
  const oldHeight = drawCanvas.height;
  const snapshot = oldWidth && oldHeight ? document.createElement("canvas") : null;

  if (snapshot) {
    snapshot.width = oldWidth;
    snapshot.height = oldHeight;
    snapshot.getContext("2d").drawImage(drawCanvas, 0, 0);
  }

  for (const canvas of [drawCanvas, guideCanvas]) {
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }

  if (snapshot) {
    drawCtx.drawImage(snapshot, 0, 0, oldWidth, oldHeight, 0, 0, drawCanvas.width, drawCanvas.height);
  }
};

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const canvasPoint = (landmark) => ({
  x: (1 - landmark.x) * drawCanvas.width,
  y: landmark.y * drawCanvas.height,
});

const weightedTipPoint = (landmarks) => {
  const tip = canvasPoint(landmarks[8]);
  const dip = canvasPoint(landmarks[7]);

  return {
    x: tip.x * 0.72 + dip.x * 0.28,
    y: tip.y * 0.72 + dip.y * 0.28,
  };
};

const smoothPoint = (point) => {
  if (!state.lastPoint) return point;

  const speed = Math.hypot(point.x - state.lastPoint.x, point.y - state.lastPoint.y);
  const speedRelief = clamp(speed / 260, 0, 0.28);
  const keep = clamp(state.smoothing - speedRelief, 0.38, 0.86);

  return {
    x: state.lastPoint.x * keep + point.x * (1 - keep),
    y: state.lastPoint.y * keep + point.y * (1 - keep),
  };
};

const handScale = (landmarks) => {
  const palm = distance(landmarks[5], landmarks[17]);
  const length = distance(landmarks[0], landmarks[9]);
  return Math.max(0.045, palm * 0.72 + length * 0.28);
};

const getPinchState = (landmarks) => {
  const normalized = distance(landmarks[4], landmarks[8]) / handScale(landmarks);
  const precise = precisionMode.checked;
  const onThreshold = precise ? 0.52 : 0.6;
  const offThreshold = precise ? 0.68 : 0.78;

  if (!state.pinchActive && normalized < onThreshold) {
    state.pinchActive = true;
  } else if (state.pinchActive && normalized > offThreshold) {
    state.pinchActive = false;
  }

  return {
    active: state.pinchActive,
    normalized,
    strength: clamp(1 - normalized / offThreshold, 0, 1),
  };
};

const drawStroke = (from, to) => {
  const jump = Math.hypot(to.x - from.x, to.y - from.y);
  if (jump > drawCanvas.width * 0.22) return;

  drawCtx.save();
  drawCtx.lineCap = "round";
  drawCtx.lineJoin = "round";
  drawCtx.lineWidth = state.mode === "eraser" ? state.size * 1.85 : state.size;
  drawCtx.globalCompositeOperation =
    state.mode === "eraser" ? "destination-out" : "source-over";
  drawCtx.strokeStyle = state.color;
  drawCtx.shadowColor = state.mode === "eraser" ? "transparent" : state.color;
  drawCtx.shadowBlur = state.mode === "eraser" ? 0 : Math.max(4, state.size * 0.7);
  drawCtx.beginPath();
  drawCtx.moveTo(from.x, from.y);
  drawCtx.quadraticCurveTo(from.x, from.y, to.x, to.y);
  drawCtx.stroke();
  drawCtx.restore();
};

const drawGuides = (landmarks, point, pinch) => {
  guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  if (!landmarks) return;

  const tip = canvasPoint(landmarks[8]);
  const thumb = canvasPoint(landmarks[4]);
  const radius = Math.max(16, state.size * 1.05);
  const dpr = window.devicePixelRatio || 1;

  guideCtx.save();
  guideCtx.lineWidth = 2.5 * dpr;
  guideCtx.strokeStyle = pinch.active ? state.color : "rgba(246,251,255,0.66)";
  guideCtx.fillStyle = pinch.active ? `${state.color}44` : "rgba(246,251,255,0.12)";
  guideCtx.shadowColor = pinch.active ? state.color : "rgba(77,234,255,0.48)";
  guideCtx.shadowBlur = pinch.active ? 24 : 14;
  guideCtx.beginPath();
  guideCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  guideCtx.fill();
  guideCtx.stroke();

  guideCtx.setLineDash([7 * dpr, 8 * dpr]);
  guideCtx.strokeStyle = pinch.active ? "rgba(32,247,178,0.85)" : "rgba(255,255,255,0.38)";
  guideCtx.beginPath();
  guideCtx.moveTo(tip.x, tip.y);
  guideCtx.lineTo(thumb.x, thumb.y);
  guideCtx.stroke();

  guideCtx.setLineDash([]);
  guideCtx.strokeStyle = "rgba(77,234,255,0.22)";
  guideCtx.beginPath();
  guideCtx.arc(point.x, point.y, radius + 12 * pinch.strength, 0, Math.PI * 2);
  guideCtx.stroke();
  guideCtx.restore();
};

const processFrame = () => {
  if (!state.running || !state.landmarker) return;

  if (video.currentTime !== state.lastVideoTime) {
    state.lastVideoTime = video.currentTime;
    const result = state.landmarker.detectForVideo(video, performance.now());
    const landmarks = result.landmarks?.[0];

    if (landmarks) {
      const pinch = getPinchState(landmarks);
      const point = smoothPoint(weightedTipPoint(landmarks));

      pinchMeter.style.setProperty("--value", `${Math.round(pinch.strength * 100)}%`);
      drawGuides(landmarks, point, pinch);
      gestureStatus.textContent = pinch.active
        ? state.mode === "eraser"
          ? "Erasing"
          : "Drawing"
        : "Hover";

      if (pinch.active && state.lastDrawPoint) {
        drawStroke(state.lastDrawPoint, point);
      }

      state.lastPoint = point;
      state.lastDrawPoint = pinch.active ? point : null;
    } else {
      guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
      pinchMeter.style.setProperty("--value", "0%");
      gestureStatus.textContent = "Waiting for hand";
      state.lastPoint = null;
      state.lastDrawPoint = null;
      state.pinchActive = false;
    }
  }

  requestAnimationFrame(processFrame);
};

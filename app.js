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

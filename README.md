# Hand Gesture Drawing App

A futuristic webcam drawing app that lets you paint in the air with hand gestures. It uses MediaPipe hand tracking in the browser, so the camera feed stays local to the user machine.

## Preview

![Gesture Draw Pro desktop preview](assets/screenshots/desktop-preview.jpg)

<p align="center">
  <img src="assets/screenshots/mobile-preview.jpg" alt="Gesture Draw Pro mobile preview" width="320" />
</p>

## Features

- Draw by pinching your thumb and index finger
- Hover by opening your fingers
- Adaptive pinch detection based on hand size
- Motion smoothing with a stabilizer slider
- Precision mode for tighter gesture control
- Pen and eraser modes
- Neon color palette
- Brush size control
- Clear canvas action
- Download drawing as a PNG
- Responsive HUD-style interface

## Tech Stack

- HTML
- CSS
- JavaScript
- MediaPipe Tasks Vision

## How To Run

Open the project with a local server:

```bash
python3 -m http.server 5173
```

Then visit:

```text
http://localhost:5173
```

Allow camera access when the browser asks for permission.

## How To Use

1. Click **Start camera**.
2. Keep one hand visible in the webcam frame.
3. Pinch your thumb and index finger to draw.
4. Open your fingers to move without drawing.
5. Use the toolbar to change color, brush size, stabilizer, mode, and export.

## Accuracy Tips

- Use bright lighting.
- Keep your hand fully inside the camera frame.
- Draw slowly for clean lines.
- Increase stabilizer for smoother strokes.
- Turn off precision mode if pinch detection feels too strict.

## Browser Support

Use a modern Chromium-based browser for the best camera and WebAssembly performance.

## Project Structure

```text
.
├── assets/
│   └── screenshots/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Privacy

The app runs hand tracking in the browser. It does not upload the webcam feed to a custom backend.

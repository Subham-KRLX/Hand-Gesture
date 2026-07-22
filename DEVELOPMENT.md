# Development Notes

This app is intentionally dependency-light: the UI is plain HTML/CSS and the hand-tracking runtime is loaded from MediaPipe in `app.js`.

## Main Files

- `index.html`: app structure and controls
- `styles.css`: HUD layout, responsive behavior, and visual styling
- `app.js`: camera setup, hand tracking, gesture logic, drawing, and export

## Manual Checks

- Start the local server with `python3 -m http.server 5173`.
- Confirm the browser asks for camera permission.
- Check pen, eraser, clear, color, stabilizer, precision, and download controls.
- Resize the browser to verify the toolbar stays usable on smaller screens.

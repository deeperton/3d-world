# WebGL World Visualization

A 3D interactive environment built with Three.js that responds to audio input. The application creates a procedurally generated world with terrain, trees, and paths that users can navigate through.

## Features

- Interactive 3D environment with procedural terrain
- Dynamic trees that respond to audio frequencies (almost)
- First-person camera controls (keyboard and mouse) - the camera is strange, need improvements
- Camera position persistence between sessions
- Audio-reactive elements (visualization of audio frequencies) - currently buggy

## Controls

### Keyboard Controls
- **W/A/S/D** - Move forward/left/backward/right
- **Shift + W/A/S/D** - Rotate camera down/left/up/right
- **R** - Reset camera position
- **Shift + R** - Reset camera rotation

### Mouse Controls
- **Left-click and drag** - Rotate camera

## Development

### Prerequisites
- Node.js
- npm

### Setup
```bash
cd webgl-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at http://localhost:3000

Built files will be located in the `dist` directory.

## Project Structure

- `src/` - Source code
    - `movement.ts` - Camera and movement controls
    - `sound/` - Audio processing and analysis
    - `world/` - World generation components
        - `terrain.ts` - Terrain generation logic
        - `trees.ts` - Tree creation and animation

## Technologies

- TypeScript
- Three.js - 3D graphics library
- Vite - Build tool and development server

## License

MIT